/*
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
/* jshint node: true */

'use strict';

const brAccount = require('bedrock-account');
const database = require('bedrock-mongodb');
const {promisify} = require('util');
const uuid = require('uuid/v4');

const api = {};
module.exports = api;

api.createAccount = email => {
  const newAccount = {
    id: 'urn:uuid:' + uuid(),
    email
  };
  return newAccount;
};

api.createIdentity = userName => {
  const newIdentity = {
    id: 'did:test:' + userName,
    label: userName,
    email: userName + '@bedrock.dev',
    url: 'https://example.com',
    description: userName
  };
  return newIdentity;
};

api.getActors = async mockData => {
  const actors = {};
  for(const [key, record] of Object.entries(mockData.accounts)) {
    actors[key] = await brAccount.getCapabilities({id: record.account.id});
  }
  return actors;
};

api.prepareDatabase = async mockData => {
  await api.removeCollections();
  await insertTestData(mockData);
};

api.removeCollections = async (collectionNames = ['account', 'identity']) => {
  await promisify(database.openCollections)(collectionNames);
  for(const collectionName of collectionNames) {
    await database.collections[collectionName].remove({});
  }
};

api.removeCollection =
  async collectionName => api.removeCollections([collectionName]);

async function insertTestData(mockData) {
  const records = Object.values(mockData.accounts);
  for(const record of records) {
    try {
      await brAccount.insert(
        {actor: null, account: record.account, meta: record.meta || {}});
    } catch(e) {
      if(e.name === 'DuplicateError') {
        // duplicate error means test data is already loaded
        continue;
      }
      throw e;
    }
  }
}
