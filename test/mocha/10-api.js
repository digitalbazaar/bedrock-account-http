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
const baseURL =
 `https://${config.server.host}${config['account-http'].routes.basePath}`;
const api = create({
  baseURL,
  httpsAgent: new https.Agent({rejectUnauthorized: false})
});

describe('bedrock-account-http  -- get /', function bedrockAccountHttp() {

  it('should return 404 is no email is specified', async function worksGreat() {
    const result = await api.get('/');
    const {status, data} = result;
    should.equal(status, 404);
    data.should.be.an('object');
    const {message, type} = data;
    message.should.match(/account does not exist/i);
    type.should.match(/NotFoundError/i);
  });

  it.skip('return an account if the email is found', async function returnAccount(){
    const accounts = await brAccount.getAll();
    console.log('accounts', accounts); 
  });
});
