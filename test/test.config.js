/*!
 * Copyright (c) 2012-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import '@bedrock/basic-authz-server';
import '@bedrock/https-agent';
import '@bedrock/did-io';
import '@bedrock/mongodb';
import '@bedrock/express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config.mocha.tests.push(path.join(__dirname, 'mocha'));

// MongoDB
config.mongodb.name = 'bedrock_account_http_test';
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

// enable sessions
config.express.useSession = true;

// allow local issuer discovery with the test server's self-signed certificate
config['https-agent'].rejectUnauthorized = false;
config['did-io'].methodOverrides.v1.disableFetch = true;

const {clients} = config['basic-authz-server'].authorization.oauth2;
for(const name of ['registration', 'otherAudience']) {
  const id = `account-http-${name}`;
  clients[name] = {
    id,
    allowedScopes: ['write:/accounts', 'read:/accounts', 'write:/unrelated'],
    // use the client ID as its secret in the test application
    secretHash: createHash('sha256').update(id).digest('base64url')
  };
}
clients.otherAudience.audience = 'https://other.example';
