/*!
 * Copyright (c) 2019-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as brAccount from '@bedrock/account';
import * as database from '@bedrock/mongodb';
import {config} from '@bedrock/core';
import {httpClient} from '@digitalbazaar/http-client';
import {httpsAgent} from '@bedrock/https-agent';
import {randomUUID} from 'node:crypto';

export function createAccount(email) {
  const newAccount = {
    id: 'urn:uuid:' + randomUUID(),
    email
  };
  return newAccount;
}

// called in test before hook
export async function prepareDatabase(mockData) {
  await removeCollections();
  await insertTestData(mockData);
}

// called by prepareDatabase
export async function removeCollections(
  collectionNames = ['account', 'account-email']) {
  await database.openCollections(collectionNames);
  for(const collectionName of collectionNames) {
    await database.collections[collectionName].deleteMany({});
  }
}

export async function removeCollection(collectionName) {
  return removeCollections([collectionName]);
}

// called by prepareDatabase
async function insertTestData(mockData) {
  const records = Object.values(mockData.accounts);
  for(const record of records) {
    try {
      await brAccount.insert({
        account: record.account, meta: record.meta || {}
      });
    } catch(e) {
      if(e.name === 'DuplicateError') {
        // duplicate error means test data is already loaded
        continue;
      }
      throw e;
    }
  }
}

export async function requestAccessToken({
  scope = 'write:/accounts', clientName = 'registration'
} = {}) {
  const {clients, routes} = config['basic-authz-server'].authorization.oauth2;
  const {id} = clients[clientName];
  const credentials = Buffer.from(`${id}:${id}`).toString('base64');
  const body = new URLSearchParams({grant_type: 'client_credentials', scope});
  const {data: {access_token: accessToken}} = await httpClient.post(
    `${config.server.baseUri}${routes.token}`, {
      agent: httpsAgent,
      body,
      headers: {authorization: `Basic ${credentials}`}
    });
  return accessToken;
}
