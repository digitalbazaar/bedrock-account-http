/*!
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */
import * as brAccount from '@bedrock/account';
import * as helpers from '../helpers.js';
import {config} from '@bedrock/core';
import {getAccountPolicy} from '@bedrock/account-http';
import {randomUUID} from 'node:crypto';

const cfg = config['account-http'];

describe('account policies', () => {
  let accountPolicies;
  let accountPolicyDefaults;
  let id;
  let meta;

  beforeEach(async () => {
    ({accountPolicies, accountPolicyDefaults} = cfg);
    cfg.accountPolicies = {};
    cfg.accountPolicyDefaults = {
      registration: {},
      legacy: {createdBefore: undefined, policy: {}},
      default: {}
    };
    const account = helpers.createAccount(`${randomUUID()}@example.com`);
    ({meta} = await brAccount.insert({account}));
    ({id} = account);
  });

  afterEach(() => {
    cfg.accountPolicies = accountPolicies;
    cfg.accountPolicyDefaults = accountPolicyDefaults;
  });

  after(async () => {
    await helpers.removeCollections();
  });

  it('returns an empty policy with the module defaults', async () => {
    const policy = await getAccountPolicy({id});
    policy.should.deep.equal({});
  });

  it('uses an explicit account policy before the creation cutoff', async () => {
    cfg.accountPolicies[id] = {meters: {create: {selected: true}}};
    cfg.accountPolicyDefaults.legacy = {
      createdBefore: meta.created + 1,
      policy: {meters: {create: {older: true}}}
    };
    const policy = await getAccountPolicy({id});
    policy.should.deep.equal({meters: {create: {selected: true}}});
  });

  it('preserves an empty explicit policy', async () => {
    cfg.accountPolicies[id] = {};
    cfg.accountPolicyDefaults.default = {meters: {create: {fallback: true}}};
    const policy = await getAccountPolicy({id});
    policy.should.deep.equal({});
  });

  it('preserves explicit product denials', async () => {
    cfg.accountPolicies[id] = {meters: {create: {selected: false}}};
    cfg.accountPolicyDefaults.default = {meters: {create: {selected: true}}};
    const policy = await getAccountPolicy({id});
    policy.should.deep.equal({meters: {create: {selected: false}}});
  });

  for(const type of ['turnstile', 'oauth2']) {
    it(`uses the configured policy for ${type} registration`, async () => {
      const account = helpers.createAccount(`${randomUUID()}@example.com`);
      await brAccount.insert({account, meta: {registration: {type}}});
      cfg.accountPolicyDefaults.registration[type] = {
        meters: {create: {registered: true}}
      };
      cfg.accountPolicyDefaults.legacy = {
        createdBefore: Date.now() + 1000,
        policy: {meters: {create: {older: true}}}
      };
      const policy = await getAccountPolicy({id: account.id});
      policy.should.deep.equal({meters: {create: {registered: true}}});
    });
  }

  it('uses an explicit policy before the registration policy', async () => {
    const account = helpers.createAccount(`${randomUUID()}@example.com`);
    await brAccount.insert({
      account, meta: {registration: {type: 'turnstile'}}
    });
    cfg.accountPolicies[account.id] = {};
    cfg.accountPolicyDefaults.registration.turnstile = {
      meters: {create: {registered: true}}
    };
    const policy = await getAccountPolicy({id: account.id});
    policy.should.deep.equal({});
  });

  for(const {offset, description, expected} of [
    {
      offset: 1, description: 'before',
      expected: {meters: {create: {older: true}}}
    },
    {offset: 0, description: 'at', expected: {}},
    {offset: -1, description: 'after', expected: {}}
  ]) {
    it(`selects the policy for an account created ${description} the cutoff`,
      async () => {
        cfg.accountPolicyDefaults.legacy = {
          createdBefore: meta.created + offset,
          policy: {meters: {create: {older: true}}}
        };
        const policy = await getAccountPolicy({id});
        policy.should.deep.equal(expected);
      });
  }

  it('requires a cutoff for the older-account policy', async () => {
    cfg.accountPolicyDefaults.legacy.policy = {meters: {create: {older: true}}};
    const policy = await getAccountPolicy({id});
    policy.should.deep.equal({});
  });

  for(const registration of [{type: 'unknown'}, {type: 'toString'}, {}, null]) {
    it(`does not grandfather registration ${JSON.stringify(registration)}`,
      async () => {
        const account = helpers.createAccount(`${randomUUID()}@example.com`);
        await brAccount.insert({account, meta: {registration}});
        cfg.accountPolicyDefaults.legacy = {
          createdBefore: Date.now() + 1000,
          policy: {meters: {create: {older: true}}}
        };
        const policy = await getAccountPolicy({id: account.id});
        policy.should.deep.equal({});
      });
  }

  it('uses the configured default for an unclassified account', async () => {
    cfg.accountPolicyDefaults.default = {meters: {create: {fallback: true}}};
    const policy = await getAccountPolicy({id});
    policy.should.deep.equal({meters: {create: {fallback: true}}});
  });

  it('ignores policy and registration fields in the account body', async () => {
    const account = {
      ...helpers.createAccount(`${randomUUID()}@example.com`),
      created: 0,
      registration: {type: 'turnstile'},
      policy: {meters: {create: {older: true}}}
    };
    await brAccount.insert({account});
    cfg.accountPolicyDefaults.registration.turnstile = {
      meters: {create: {registered: true}}
    };
    cfg.accountPolicyDefaults.legacy = {
      createdBefore: 1,
      policy: {meters: {create: {older: true}}}
    };
    const policy = await getAccountPolicy({id: account.id});
    policy.should.deep.equal({});
  });

  it('does not let a returned policy change configuration', async () => {
    cfg.accountPolicies[id] = {meters: {create: {selected: false}}};
    const policy = await getAccountPolicy({id});
    policy.meters.create.selected = true;
    const nextPolicy = await getAccountPolicy({id});
    nextPolicy.should.deep.equal({meters: {create: {selected: false}}});
  });

  it('reads current config without storing a computed policy', async () => {
    await getAccountPolicy({id});
    cfg.accountPolicyDefaults.default = {meters: {create: {changed: true}}};
    const policy = await getAccountPolicy({id});
    policy.should.deep.equal({meters: {create: {changed: true}}});
    const record = await brAccount.get({id});
    record.meta.should.not.have.property('policy');
    record.meta.should.not.have.property('accountPolicy');
    record.meta.created.should.equal(meta.created);
    record.meta.sequence.should.equal(meta.sequence);
  });

  it('requires an existing account even when an explicit policy is set',
    async () => {
      const id = `urn:uuid:${randomUUID()}`;
      cfg.accountPolicies[id] = {meters: {create: {selected: true}}};
      let err;
      try {
        await getAccountPolicy({id});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('NotFoundError');
    });

  for(const createdBefore of ['not-a-timestamp', null, -1, 1.5]) {
    it(`rejects the cutoff ${JSON.stringify(createdBefore)}`, async () => {
      cfg.accountPolicyDefaults.legacy.createdBefore = createdBefore;
      let err;
      try {
        await getAccountPolicy({id});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      err.name.should.equal('InvalidStateError');
      err.details.httpStatusCode.should.equal(500);
      should.equal(err.details.actual, createdBefore);
    });
  }
});
