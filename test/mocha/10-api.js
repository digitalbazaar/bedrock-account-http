/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const {config} = bedrock;
const {expect} = chai;
// apisauce is a wrapper around axios that provides improved error handling
const {create} = require('apisauce');
const https = require('https');
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
    expect(status, 'Expected 404 not found').to.equal(404);
    expect(data).to.be.an('object');
    const {message, type} = data;
    expect(message).to.match(/account does not exist/i);
    expect(type).to.match(/NotFoundError/i);
  });
});
