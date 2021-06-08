/*!
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

const bedrock = require('bedrock');
const {config} = bedrock;
// apisauce is a wrapper around axios that provides improved error handling
const {create} = require('apisauce');
const https = require('https');
const helpers = require('../helpers');
const mockData = require('../mock.data');

const Emails = {
  admin: 'admin@example.com',
  alpha: 'alpha@example.com',
  multi: 'multi@example.com',
  updated: 'will-be-updated@example.com'
};

let accounts;
let api;
let actors;

const baseURL =
 `https://${config.server.host}${config['account-http'].routes.basePath}`;

// simple quick func to check validation errors
// TODO extend mocha should with this
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

passportStub.callsFake((req, res, next) => next());

function stubPassportStub(email) {
  passportStub.callsFake((req, res, next) => {
    req.user = {
      actor: actors[email],
      account: accounts[email].account
    };
    next();
  });
}

describe('bedrock-account-http', function bedrockAccountHttp() {
  before(async function setup() {
    await helpers.prepareDatabase(mockData);
    actors = await helpers.getActors(mockData);
    accounts = mockData.accounts;
    api = create({
      baseURL,
      httpsAgent: new https.Agent({rejectUnauthorized: false})
    });
  });
  after(async function() {
    passportStub.restore();
    await helpers.removeCollections();
  });

  describe('post /', function() {
    it('should return 400 if there is no email', async function() {
      const result = await api.post('/');
      validationError(result, 'post', /email/i);
    });

    it('should return 201 if there is an email', async function() {
      const result = await api.post('/', {email: 'newuser@digitalbazaar.com'});
      result.status.should.equal(201);
    });

    it('should return 409 for accounts with the same email', async function() {
      const email = {email: 'multiple@digitalbazaar.com'};
      const result1 = await api.post('/', email);
      const result2 = await api.post('/', email);

      result1.status.should.equal(201);
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
        result.data.message.should.equal(`A validation error occured in the ` +
          `'bedrock-accounts-http account creation post' validator.`);
        result.data.details.httpStatusCode.should.equal(400);
      });

  });

  describe('get /:account', function() {
    it('should return an account', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.admin);
      const result = await api.get(`/${id}`);
      result.status.should.equal(200);
      const {data} = result;
      data.should.be.an('object');
      data.should.have.property('meta');
      data.should.have.property('account');
    });

    it('should return 403 if actor does not have permission', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.multi);
      const result = await api.get(`/${id}`);
      result.status.should.equal(403);
      const {data} = result;
      data.should.be.an('object');
      data.should.not.have.property('meta');
      data.should.not.have.property('account');
    });

    it('should return 404 if not account for id', async function() {
      const id = 'does-not-exist';
      stubPassportStub(Emails.admin);
      const result = await api.get(`/${id}`);
      result.status.should.equal(404);
      const {data} = result;
      data.should.be.an('object');
      data.should.not.have.property('meta');
      data.should.not.have.property('account');
    });
  });

  describe('post /:account/status', function() {
    it('should change the status to deleted', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.admin);
      const status = 'deleted';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(204);
      const nextResult = await api.get(`/${id}`);
      nextResult.data.should.have.property('meta');
      nextResult.data.meta.should.have.property('status');
      nextResult.data.meta.status.should.equal(status);
    });

    it('should change the status to disabled', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.admin);
      const status = 'disabled';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(204);
      const nextResult = await api.get(`/${id}`);
      nextResult.data.should.have.property('meta');
      nextResult.data.meta.should.have.property('status');
      nextResult.data.meta.status.should.equal(status);
    });

    it('should change the status to active', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.admin);
      const status = 'active';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(204);
      const nextResult = await api.get(`/${id}`);
      nextResult.data.should.have.property('meta');
      nextResult.data.meta.should.have.property('status');
      nextResult.data.meta.status.should.equal(status);
    });

    it('should return 403', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.multi);
      const status = 'deleted';
      const result = await api.post(`/${id}/status`, {status});
      result.status.should.equal(403);
    });

    it('should return 400', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.multi);
      const result = await api.post(`/${id}/status`);
      validationError(result, 'patch', /status/i);
    });
  });
  describe('get /:account/roles', function() {
    it('should return an account', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      const result = await api.get(`/${id}/roles`);
      result.status.should.equal(200);
      const {data} = result;
      data.should.be.an('object');
      data.should.have.property('id');
      data.should.have.property('sysResourceRole');
      data.sysResourceRole.should.be.an('array');
      data.sysResourceRole.forEach(role => {
        role.should.have.property('sysRole');
        role.sysRole.should.be.an('string');
        role.should.have.property('resource');
        role.resource.should.be.an('array');
      });
    });
  });

  describe('patch /:account', function() {

    it('should update an account', async function() {
      const {account: {id}} = accounts[Emails.updated];
      stubPassportStub(Emails.admin);
      const value = 'updated@tester.org';
      const patch = [{op: 'replace', path: '/email', value}];
      const patchResult = await api.patch(`/${id}`, {sequence: 0, patch});
      patchResult.status.should.equal(204);
      const getResult = await api.get(`/${id}`);
      getResult.status.should.equal(200);
      const {data} = getResult;
      data.should.be.an('object');
      data.should.have.property('meta');
      data.should.have.property('account');
      const {account} = data;
      account.should.have.property('email');
      account.email.should.equal(value);
      account.email.should.not.contain(Emails.updated);
    });

    it('should fail if there are no patches', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.admin);
      const result = await api.patch(`/${id}`, {sequence: 10, patch: []});
      validationError(result, 'update', /items/i);
    });

    it('should fail if there are extra paramaters', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.admin);
      const value = 'fail@extras.org';
      const patch = [{op: 'replace', path: '/email', value}];
      const result = await api
        .patch(`/${id}`, {sequence: 10, patch, extra: true});
      validationError(result, 'update', /additional/i);
    });

    it('should fail if there is no sequence', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      stubPassportStub(Emails.admin);
      const value = 'updated@tester.org';
      const patch = [{op: 'replace', path: '/email', value}];
      const result = await api.patch(`/${id}`, {patch});
      validationError(result, 'update', /sequence/i);
    });
  });

  describe('get /', function getIndex() {
    it('should return 400 with no email', async function worksGreat() {
      const result = await api.get('/');
      validationError(result, 'get', /email/i);
    });

    it('return 200 if the email is found', async function returnAccount() {
      const email = 'admin@example.com';
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
      stubPassportStub(Emails.admin);
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
      stubPassportStub(Emails.admin);
      const result = await api.get('/', {email});
      validationError(result, 'accounts', /email/i);
    });

    it('should fail if there are extra parameters', async function() {
      const email = 'tomany@params.org';
      stubPassportStub(Emails.admin);
      const result = await api.get('/', {email, extra: true});
      validationError(result, 'accounts', /additional/i);
    });

    it('should return 403 due to permission', async function() {
      const email = 'admin@example.com';
      stubPassportStub(Emails.multi);
      const result = await api.get('/', {email});
      result.status.should.equal(403);
      const {data} = result;
      data.should.be.an('object');
      data.should.not.have.property('meta');
      data.should.not.have.property('account');
    });
  });
});
