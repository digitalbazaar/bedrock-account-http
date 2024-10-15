/*!
 * Copyright (c) 2019-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as brAccount from '@bedrock/account';
import * as database from '@bedrock/mongodb';
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
