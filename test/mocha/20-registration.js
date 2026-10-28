/*!
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import * as brAccount from '@bedrock/account';
import * as helpers from '../helpers.js';
import {config} from '@bedrock/core';
import {create} from 'apisauce';
import https from 'node:https';
import {randomUUID} from 'node:crypto';

let api;
const cfg = config['account-http'].registration;

describe('registration authorization', () => {
  before(() => {
    const {baseUri} = config.server;
    const {routes} = config['basic-authz-server'].authorization.oauth2;
    cfg.oauth2.issuerConfigUrl = `${baseUri}${routes.asMetadata}`;
    api = create({
      baseURL: `${baseUri}${config['account-http'].routes.basePath}`,
      httpsAgent: new https.Agent({rejectUnauthorized: false})
    });
  });

  afterEach(() => {
    cfg.authorizationRequired = false;
  });

  after(async () => {
    await helpers.removeCollections();
  });

  it('records OAuth2 registration using a string setting', async () => {
    cfg.authorizationRequired = 'oauth2';
    const accessToken = await helpers.requestAccessToken();
    const result = await api.post('/', {
      email: `${randomUUID()}@example.com`, authorization: {type: 'oauth2'}
    }, {headers: {authorization: `Bearer ${accessToken}`}});
    result.status.should.equal(201);
    const {meta} = await brAccount.get({id: result.data.id});
    meta.registration.should.deep.equal({type: 'oauth2'});
  });

  it('returns registration metadata through an authenticated account read',
    async () => {
      cfg.authorizationRequired = 'oauth2';
      const accountConfig = config['account-http'];
      const {autoLoginNewAccounts} = accountConfig;
      try {
        accountConfig.autoLoginNewAccounts = true;
        const accessToken = await helpers.requestAccessToken();
        const result = await api.post('/', {
          email: `${randomUUID()}@example.com`, authorization: {type: 'oauth2'}
        }, {headers: {authorization: `Bearer ${accessToken}`}});
        result.status.should.equal(201);
        const cookies = [].concat(result.headers['set-cookie']);
        const cookie = cookies.map(value => value.split(';')[0]).join('; ');
        const response = await api.get(`/${result.data.id}`, {}, {
          headers: {cookie}
        });
        response.status.should.equal(200);
        response.data.meta.registration.should.deep.equal({type: 'oauth2'});
      } finally {
        accountConfig.autoLoginNewAccounts = autoLoginNewAccounts;
      }
    });

  it('accepts OAuth2 as one of the configured methods', async () => {
    cfg.authorizationRequired = ['turnstile', 'oauth2'];
    const accessToken = await helpers.requestAccessToken();
    const result = await api.post('/', {
      email: `${randomUUID()}@example.com`, authorization: {type: 'oauth2'}
    }, {headers: {authorization: `Bearer ${accessToken}`}});
    result.status.should.equal(201);
    const {meta} = await brAccount.get({id: result.data.id});
    meta.registration.should.deep.equal({type: 'oauth2'});
  });

  it('accepts Turnstile as one of the configured methods', async () => {
    cfg.authorizationRequired = ['turnstile', 'oauth2'];
    const result = await api.post('/', {
      email: `${randomUUID()}@example.com`,
      authorization: {type: 'turnstile', token: 'XXXX.DUMMY.TOKEN.XXXX'}
    });
    result.status.should.equal(201);
    const {meta} = await brAccount.get({id: result.data.id});
    meta.registration.should.deep.equal({type: 'turnstile'});
  });

  it('rejects registration without a required proof', async () => {
    cfg.authorizationRequired = ['turnstile', 'oauth2'];
    const email = `${randomUUID()}@example.com`;
    const result = await api.post('/', {email});
    result.status.should.equal(403);
    result.data.type.should.equal('NotAllowedError');
    const exists = await brAccount.exists({email});
    exists.should.equal(false);
  });

  it('rejects OAuth2 when only Turnstile is enabled', async () => {
    cfg.authorizationRequired = 'turnstile';
    const accessToken = await helpers.requestAccessToken();
    const email = `${randomUUID()}@example.com`;
    const result = await api.post('/', {
      email, authorization: {type: 'oauth2'}
    }, {headers: {authorization: `Bearer ${accessToken}`}});
    result.status.should.equal(403);
    result.data.type.should.equal('NotAllowedError');
    const exists = await brAccount.exists({email});
    exists.should.equal(false);
  });

  it('rejects OAuth2 without a Bearer token', async () => {
    cfg.authorizationRequired = 'oauth2';
    const email = `${randomUUID()}@example.com`;
    const result = await api.post('/', {
      email, authorization: {type: 'oauth2'}
    });
    result.status.should.equal(403);
    result.data.type.should.equal('NotAllowedError');
    result.data.details.code.should.equal('ERR_JWT_INVALID');
    const exists = await brAccount.exists({email});
    exists.should.equal(false);
  });

  it('rejects a malformed Bearer token without falling back', async () => {
    cfg.authorizationRequired = ['turnstile', 'oauth2'];
    const email = `${randomUUID()}@example.com`;
    const result = await api.post('/', {
      email, authorization: {type: 'oauth2'}
    }, {headers: {authorization: 'Bearer invalid'}});
    result.status.should.equal(403);
    result.data.type.should.equal('NotAllowedError');
    result.data.details.code.should.equal('ERR_JWS_INVALID');
    const exists = await brAccount.exists({email});
    exists.should.equal(false);
  });

  for(const scope of ['read:/accounts', 'write:/unrelated']) {
    it(`rejects the unrelated scope ${scope}`, async () => {
      cfg.authorizationRequired = 'oauth2';
      const accessToken = await helpers.requestAccessToken({scope});
      const email = `${randomUUID()}@example.com`;
      const result = await api.post('/', {
        email, authorization: {type: 'oauth2'}
      }, {headers: {authorization: `Bearer ${accessToken}`}});
      result.status.should.equal(403);
      result.data.type.should.equal('NotAllowedError');
      result.data.details.code.should.equal('ERR_JWT_CLAIM_VALIDATION_FAILED');
      result.data.details.claim.should.equal('scope');
      const exists = await brAccount.exists({email});
      exists.should.equal(false);
    });
  }

  it('rejects a token issued for another audience', async () => {
    cfg.authorizationRequired = 'oauth2';
    const accessToken = await helpers.requestAccessToken({
      clientName: 'otherAudience'
    });
    const email = `${randomUUID()}@example.com`;
    const result = await api.post('/', {
      email, authorization: {type: 'oauth2'}
    }, {headers: {authorization: `Bearer ${accessToken}`}});
    result.status.should.equal(403);
    result.data.type.should.equal('NotAllowedError');
    result.data.details.code.should.equal('ERR_JWT_CLAIM_VALIDATION_FAILED');
    result.data.details.claim.should.equal('aud');
    const exists = await brAccount.exists({email});
    exists.should.equal(false);
  });

  it('rejects an expired token', async () => {
    cfg.authorizationRequired = 'oauth2';
    const {accessTokens} = config['basic-authz-server'].authorization.oauth2;
    const {ttl} = accessTokens;
    let accessToken;
    try {
      accessTokens.ttl = -1000;
      accessToken = await helpers.requestAccessToken();
    } finally {
      accessTokens.ttl = ttl;
    }
    const email = `${randomUUID()}@example.com`;
    const result = await api.post('/', {
      email, authorization: {type: 'oauth2'}
    }, {headers: {authorization: `Bearer ${accessToken}`}});
    result.status.should.equal(403);
    result.data.type.should.equal('NotAllowedError');
    result.data.details.code.should.equal('ERR_JWT_EXPIRED');
    result.data.details.claim.should.equal('exp');
    const exists = await brAccount.exists({email});
    exists.should.equal(false);
  });

  it('rejects OAuth2 credentials in the request body', async () => {
    cfg.authorizationRequired = 'oauth2';
    const result = await api.post('/', {
      email: `${randomUUID()}@example.com`,
      authorization: {type: 'oauth2', token: 'body-token'}
    });
    result.status.should.equal(400);
  });

  it('does not record unverified evidence when authorization is disabled',
    async () => {
      const result = await api.post('/', {
        email: `${randomUUID()}@example.com`, authorization: {type: 'oauth2'}
      });
      result.status.should.equal(201);
      const {meta} = await brAccount.get({id: result.data.id});
      meta.should.not.have.property('registration');
    });

  for(const setting of ['', []]) {
    it(`allows open registration with ${JSON.stringify(setting)}`, async () => {
      cfg.authorizationRequired = setting;
      const result = await api.post('/', {
        email: `${randomUUID()}@example.com`
      });
      result.status.should.equal(201);
      const {meta} = await brAccount.get({id: result.data.id});
      meta.should.not.have.property('registration');
    });
  }

  it('rejects caller-supplied registration metadata', async () => {
    const result = await api.post('/', {
      email: `${randomUUID()}@example.com`,
      meta: {registration: {type: 'oauth2'}}
    });
    result.status.should.equal(400);
  });
});
