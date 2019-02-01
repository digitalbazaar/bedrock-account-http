/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const bedrock = require('bedrock');
const {config} = bedrock;
// apisauce is a wrapper around axios that provides improved error handling
const {create} = require('apisauce');
const https = require('https');
const baseURL =
 `https://${config.server.host}${config['account-http'].routes.basePath}`;
const api = create({
  baseURL,
  httpsAgent: new https.Agent({rejectUnauthorized: false})
});

describe('bedrock-account-http', () => {
  it('works great', async () => {
    const result = await api.get('/');
    console.log('RRRRRRRR', result);
  });
});
