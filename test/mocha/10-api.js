/*!
 * Copyright (c) 2019-2026 Digital Bazaar, Inc. All rights reserved.
 */
import * as helpers from '../helpers.js';
import {_deserializeUser} from '@bedrock/passport';
import {config} from '@bedrock/core';
// apisauce is a wrapper around axios that provides improved error handling
import {create} from 'apisauce';
import https from 'node:https';
import {mockData} from '../mock.data.js';
import {randomUUID} from 'node:crypto';

const emails = {
  alpha: 'alpha@example.com',
  multi: 'multi@example.com',
  updated: 'will-be-updated@example.com'
};

let accounts;
let api;

const baseURL =
 `https://${config.server.host}${config['account-http'].routes.basePath}`;

// simple quick func to check validation errors
function validationError(
  result, errorMethod,
  expectedError, expectedStatus = 400
) {
  result.status.should.equal(expectedStatus);
  result.data.should.have.property('message');
  result.data.should.have.property('type');
  result.data.type.should.match(/ValidationError/i);
  result.data.should.have.property('details');
  result.data.details.should.be.an('object');
  result.data.should.have.property('cause');
  result.data.message.should.contain(errorMethod);
  const {details} = result.data;
  details.should.have.property('errors');
  details.errors.should.be.an('array');
  details.errors.length.should.be.gte(0);
  const testError = details.errors.find(e => expectedError.test(e.message));
  should.exist(testError);
}

const passportStubSettings = {email: null};
function stubPassportStub(email) {
  passportStubSettings.email = email;
}

passportStub.callsFake((strategyName, options, callback) => {
  // eslint-disable-next-line no-unused-vars
  return async function(req, res, next) {
    req.isAuthenticated = req.isAuthenticated || (() => !!req.user);
    let user = false;
    try {
      const {email} = passportStubSettings;
      if(email) {
        user = await _deserializeUser({
          accountId: accounts[email].account.id
        });
      }
    } catch(e) {
      return callback(e);
    }
    callback(null, user);
  };
});

describe('bedrock-account-http', function bedrockAccountHttp() {
  before(async function setup() {
    await helpers.prepareDatabase(mockData);
    accounts = {...mockData.accounts};
    api = create({
      baseURL,
      httpsAgent: new https.Agent({rejectUnauthorized: false})
    });
  });
  afterEach(function() {
    stubPassportStub(null);
  });
  after(async function() {
    passportStub.restore();
    await helpers.removeCollections();
  });

  describe('post /', function() {
    it('should create account with authorization', async function() {
      config['account-http'].registration.authorizationRequired = 'turnstile';
      const authorization = {
        token: 'XXXX.DUMMY.TOKEN.XXXX',
        type: 'turnstile'
      };
      const email = {email: 'auth@digitalbazaar.com', authorization};
      const result = await api.post('/', email);
      result.status.should.equal(201);
      config['account-http'].registration.authorizationRequired = false;
    });
    it('should create account without authorization', async function() {
      const email = {email: 'noauth@digitalbazaar.com'};
      const result = await api.post('/', email);
      result.status.should.equal(201);
    });
    it('should return 400 if there is no email', async function() {
      const result = await api.post('/');
      validationError(result, 'Create Account', /email/i);
    });

    it('should return 201 if there is an email', async function() {
      const result = await api.post('/', {
        email: 'newuser@digitalbazaar.com'
      });
      result.status.should.equal(201);
    });

    it('should return 409 for accounts with the same email', async function() {
      const email = {email: 'multiple@digitalbazaar.com'};
      const result1 = await api.post('/', email);
      const result2 = await api.post('/', email);

      result1.status.should.equal(201);
      result2.status.should.equal(409);
      result2.data.type.should.equal('DuplicateError');
      result2.data.message.should.equal('Duplicate account.');
      result2.data.details.httpStatusCode.should.equal(409);
    });

    it('should return 400 if the email contains uppercase chars',
      async function() {
        const result = await api.post('/',
          {email: 'newUser@digitalbazaar.com'});
        result.status.should.equal(400);
        result.data.type.should.equal('ValidationError');
        result.data.message.should.equal(`A validation error occurred in the ` +
          `'Create Account' validator.`);
        result.data.details.httpStatusCode.should.equal(400);
      });
  });

  describe('post / with a telephone number', function() {
    it('should create an account from a telephone number alone',
      async function() {
        const telephone = '+15550100001';
        const result = await api.post('/', {telephone});
        result.status.should.equal(201);

        // the response body is the request echoed back, so confirm the
        // account is actually findable by the number
        const found = await api.get(
          `/?telephone=${encodeURIComponent(telephone)}&exists=true`);
        found.status.should.equal(200);
      });

    it('should create an account with both identifiers', async function() {
      const email = 'both@digitalbazaar.com';
      const telephone = '+15550100002';
      const result = await api.post('/', {email, telephone});
      result.status.should.equal(201);

      const byEmail = await api.get(
        `/?email=${encodeURIComponent(email)}&exists=true`);
      byEmail.status.should.equal(200);
      const byTelephone = await api.get(
        `/?telephone=${encodeURIComponent(telephone)}&exists=true`);
      byTelephone.status.should.equal(200);
    });

    it('should return 409 for accounts with the same telephone number',
      async function() {
        const body = {telephone: '+15550100003'};
        const result1 = await api.post('/', body);
        const result2 = await api.post('/', body);
        result1.status.should.equal(201);
        result2.status.should.equal(409);
        result2.data.type.should.equal('DuplicateError');
        // pinned to the telephone index: a collision on any unique field would
        // otherwise satisfy this
        result2.data.details.uniqueField.should.equal('telephone');
      });

    it('should reject a telephone number that is not E.164', async function() {
      for(const telephone of ['5550100004', '555 010 0004', '+1 555-0100']) {
        const result = await api.post('/', {telephone});
        result.status.should.equal(400, `for ${telephone}`);
        result.data.type.should.equal('ValidationError', `for ${telephone}`);
        /* Name the field that failed. A bare ValidationError is also what a
        pattern matching nothing produces, which would leave this green while
        the E.164 rule had stopped meaning anything. */
        const paths = (result.data.details?.errors ?? [])
          .map(e => e.details?.path ?? e.details?.instancePath);
        paths.should.include('.telephone', `for ${telephone}`);
      }
      // a normalized number is accepted, so the rule is not rejecting all
      const ok = await api.post('/', {telephone: '+15550100005'});
      ok.status.should.equal(201);
    });

    it('should return 400 when neither identifier is given',
      async function() {
        const result = await api.post('/', {});
        result.status.should.equal(400);
        result.data.type.should.equal('ValidationError');
        /* Distinguish "one of email or telephone" from the older
        "email is required": under the latter a telephone-only body would fail,
        so assert it is accepted. */
        const telephoneOnly = await api.post('/', {telephone: '+15550100006'});
        telephoneOnly.status.should.equal(201);
      });
  });

  describe('get / by telephone number', function() {
    /* The leading `+` of an E.164 number has to be percent-encoded in a query
    string, where a bare `+` means a space. These call the encoded form on
    purpose, and the last case pins the consequence of getting it wrong. */
    it('should confirm existence by telephone number', async function() {
      const telephone = '+15550100010';
      await api.post('/', {telephone});
      const query =
        `?telephone=${encodeURIComponent(telephone)}&exists=true`;
      const result = await api.get(`/${query}`);
      result.status.should.equal(200);
    });

    it('should 404 for a telephone number with no account', async function() {
      const telephone = encodeURIComponent('+15550100099');
      const result = await api.get(`/?telephone=${telephone}&exists=true`);
      result.status.should.equal(404);
    });

    it('should reject an unencoded plus, which arrives as a space',
      async function() {
        const result = await api.get('/?telephone=+15550100010&exists=true');
        result.status.should.equal(400);
        result.data.type.should.equal('ValidationError');
        const errors = result.data.details?.errors ?? [];
        const paths = errors.map(e => e.details?.path);
        paths.should.include('.telephone');
        const [{details}] = result.data.details.errors;
        details.value.should.equal('***MASKED***');
      });

  });

  describe('get /:account', function() {
    it('should return an account', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(emails.alpha);
      const result = await api.get(`/${id}`);
      result.status.should.equal(200);
      const {data} = result;
      data.should.be.an('object');
      data.should.have.property('meta');
      data.should.have.property('account');
    });

    it('should return 403', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(emails.multi);
      const result = await api.get(`/${id}`);
      result.status.should.equal(403);
      const {data} = result;
      data.should.be.an('object');
      data.should.not.have.property('meta');
      data.should.not.have.property('account');
    });

    it('should return 403 if no account exists for id', async function() {
      const id = 'does-not-exist';
      stubPassportStub(emails.alpha);
      const result = await api.get(`/${id}`);
      result.status.should.equal(403);
      const {data} = result;
      data.should.be.an('object');
      data.should.not.have.property('meta');
      data.should.not.have.property('account');
    });
  });

  describe('post /:account/status', function() {
    it('should change the status to deleted', async function() {
      const email = `${randomUUID()}@digitalbazaar.com`;
      const {data} = await api.post('/', {email});
      accounts[email] = {account: data, meta: {}};
      const {id} = data;
      stubPassportStub(email);
      const status = 'deleted';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(204);
      const nextResult = await api.get(`/${id}`);
      nextResult.status.should.equal(404);
    });

    it('should change the status to disabled', async function() {
      const email = `${randomUUID()}@digitalbazaar.com`;
      const {data} = await api.post('/', {email});
      accounts[email] = {account: data, meta: {}};
      const {id} = data;
      stubPassportStub(email);
      const status = 'disabled';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(204);
      const nextResult = await api.get(`/${id}`);
      nextResult.status.should.equal(403);
    });

    it('should keep status at active', async function() {
      const email = `${randomUUID()}@digitalbazaar.com`;
      const {data} = await api.post('/', {email});
      accounts[email] = {account: data, meta: {}};
      const {id} = data;
      stubPassportStub(email);
      const status = 'active';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(204);
      const nextResult = await api.get(`/${id}`);
      nextResult.data.should.have.property('meta');
      nextResult.data.meta.should.have.property('status');
      nextResult.data.meta.status.should.equal(status);
    });

    it('should fail to reactivate disabled account', async function() {
      const email = `${randomUUID()}@digitalbazaar.com`;
      const {data} = await api.post('/', {email});
      accounts[email] = {account: data, meta: {}};
      const {id} = data;
      stubPassportStub(email);
      const status = 'disabled';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(204);

      const nextResult = await api.post(`/${id}/status`, {status: 'active'});
      nextResult.status.should.equal(403);
    });

    it('should fail to reactivate deleted account', async function() {
      const email = `${randomUUID()}@digitalbazaar.com`;
      const {data} = await api.post('/', {email});
      accounts[email] = {account: data, meta: {}};
      const {id} = data;
      stubPassportStub(email);
      const status = 'deleted';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(204);

      const nextResult = await api.post(`/${id}/status`, {status: 'active'});
      nextResult.status.should.equal(404);
    });

    it('should return 403', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(emails.multi);
      const status = 'deleted';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(403);
    });

    it('should return 400', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(emails.multi);
      const result = await api.post(`/${id}/status`);
      validationError(result, 'Set Account Status', /status/i);
    });
  });

  describe('update /:account', function() {
    it('should update an account', async function() {
      const {account: existingAccount} = accounts[emails.updated];
      stubPassportStub(emails.updated);
      const value = 'updated@tester.org';
      const updatedAccount = {...existingAccount, email: value};
      const updateResult = await api.post(
        `/${existingAccount.id}`, {sequence: 0, account: updatedAccount});
      updateResult.status.should.equal(204);
      const getResult = await api.get(`/${existingAccount.id}`);
      getResult.status.should.equal(200);
      const {data} = getResult;
      data.should.be.an('object');
      data.should.have.property('meta');
      data.should.have.property('account');
      const {account} = data;
      account.should.have.property('email');
      account.email.should.equal(value);
      account.email.should.not.contain(emails.updated);
    });

    it('should fail if no account is in the body', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(emails.alpha);
      const result = await api.post(`/${id}`, {sequence: 10});
      validationError(result, 'Update Account', /account/i);
    });

    it('should fail if there are extra paramaters', async function() {
      const {account: existingAccount} = accounts['alpha@example.com'];
      stubPassportStub(emails.alpha);
      const value = 'fail@extras.org';
      const updatedAccount = {...existingAccount, email: value};
      const result = await api.post(`/${existingAccount.id}`, {
        sequence: 10, account: updatedAccount, extra: true
      });
      validationError(result, 'Update Account', /additional/i);
    });

    it('should fail if there is no sequence', async function() {
      const {account: existingAccount} = accounts['alpha@example.com'];
      stubPassportStub(emails.alpha);
      const value = 'updated@tester.org';
      const updatedAccount = {...existingAccount, email: value};
      const result = await api.post(
        `/${existingAccount.id}`, {account: updatedAccount});
      validationError(result, 'Update Account', /sequence/i);
    });
  });

  describe('get /', function getIndex() {
    it('should return 400 with no email', async function worksGreat() {
      const result = await api.get('/');
      validationError(result, 'Get Accounts', /email/i);
    });

    it('return 200 if the email is found', async function returnAccount() {
      const email = 'alpha@example.com';
      const result = await api.get('/', {exists: true, email});
      const {status} = result;
      should.equal(status, 200);
    });

    it('return 404 if the email is not found', async function returnAccount() {
      const email = 'not-found@example.com';
      const result = await api.get('/', {exists: true, email});
      const {status, data} = result;
      should.equal(status, 404);
      data.should.be.an('object');
      const {message, type} = data;
      message.should.match(/account does not exist/i);
      type.should.match(/NotFoundError/i);
    });

    it('should return only 1 account', async function() {
      const email = 'multi@example.com';
      stubPassportStub(emails.multi);
      const result = await api.get('/', {email});
      result.data.should.be.an('array');
      const {data} = result;
      data.length.should.equal(1);
      data[0].should.be.an('object');
      data[0].should.have.property('account');
      data[0].should.have.property('meta');
      const {account} = data[0];
      account.should.have.property('id');
      account.should.have.property('email');
      account.email.should.equal(email);
    });

    it('should return 400 invalid', async function() {
      const email = null;
      stubPassportStub(emails.alpha);
      const result = await api.get('/', {email});
      validationError(result, 'Get Accounts', /email/i);
    });

    it('should fail if there are extra parameters', async function() {
      const email = 'tomany@params.org';
      stubPassportStub(emails.alpha);
      const result = await api.get('/', {email, extra: true});
      validationError(result, 'Get Accounts', /additional/i);
    });

    it('should accept a whole-string integer limit', async function() {
      const result = await api.get(
        '/?email=alpha@example.com&exists=true&limit=5');
      result.status.should.equal(200);
    });

    it('should reject a limit that is not wholly a decimal integer',
      async function() {
        const limits = ['1garbage', '2.5', '', '0', '1e2', '0x10', '%205%20'];
        for(const limit of limits) {
          const result = await api.get(
            `/?email=alpha@example.com&exists=true&limit=${limit}`);
          result.status.should.equal(400, `for limit=${limit}`);
          result.data.type.should.equal('ValidationError');
          const paths = result.data.details.errors.map(e => e.details.path);
          paths.should.include('.limit', `for limit=${limit}`);
        }
      });

    it('should return no results for non-matching account', async function() {
      const email = 'multi@example.com';
      stubPassportStub(emails.alpha);
      const result = await api.get('/', {email});
      result.status.should.equal(200);
      const {data} = result;
      data.should.be.an('array');
      data.length.should.equal(0);
    });
  });
});
