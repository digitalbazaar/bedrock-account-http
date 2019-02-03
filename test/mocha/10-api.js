/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const {config} = bedrock;
// apisauce is a wrapper around axios that provides improved error handling
const {create} = require('apisauce');
const https = require('https');
const brAccount = require('bedrock-account');
const helpers = require('../helpers');
const mockData = require('../mock.data');

let actors;
let accounts;
let api;
let stub;

const baseURL =
 `https://${config.server.host}${config['account-http'].routes.basePath}`;
 
describe('bedrock-account-http', function bedrockAccountHttp() {
    before(async function setup() {
      passportStub.callsFake((req, res, next) => next());
      await helpers.prepareDatabase(mockData);
      actors = await helpers.getActors(mockData);
      accounts = mockData.accounts;
      api = create({
        baseURL,
        httpsAgent: new https.Agent({rejectUnauthorized: false})
        });
    });
  describe('get /', function getIndex() {
    it('should return 404 is no email is specified', async function worksGreat() {
      const result = await api.get('/');
      const {status, data} = result;
      should.equal(status, 404);
      data.should.be.an('object');
      const {message, type} = data;
      message.should.match(/account does not exist/i);
      type.should.match(/NotFoundError/i);
    });

    it('return 200 if the email is found', async function returnAccount(){
      const email = 'alpha@example.com';
      const result = await api.get('/', {exists: true, email});
      const {status} = result;
      should.equal(status, 200);
    });

    it('return 404 if the email is not found', async function returnAccount(){
      const email = 'not-found@example.com';
      const result = await api.get('/', {exists: true, email});
      const {status, data} = result;
      should.equal(status, 404);
      data.should.be.an('object');
      const {message, type} = data;
      message.should.match(/account does not exist/i);
      type.should.match(/NotFoundError/i);
    });
  });

  describe('post /', function() {
    it.skip('should return 400 if there is no email', async function() {
      const result = await api.post('/');
      result.status.should.equal(400);
    });
 
    it('should return 201 if there is an email', async function() {
      const result = await api.post('/', {email: 'newuser@digitalbazaar.com'});
      result.status.should.equal(201);
    });   
  });  

  describe('get /:account', function() {
    it('should return an account', async function() {
      const {account: {id}} = accounts['alpha@example.com'];
      const {account: actor} = accounts['admin@example.com'];
      passportStub.callsFake((req, res, next) => {
        req.user = {actor}; 
        next();
      });
      const result = await api.get(`/${id}`);
    });

    it.skip('should return 404', async function() {

    });
  });

});
