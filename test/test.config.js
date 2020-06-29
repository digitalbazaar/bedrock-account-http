/*!
 * Copyright (c) 2012-2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');
const path = require('path');

const {permissions, roles} = config.permission;

config.mocha.tests.push(path.join(__dirname, 'mocha'));

// MongoDB
config.mongodb.name = 'bedrock_account_http_test';
config.mongodb.local.collection = 'bedrock_account_http_test';
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

roles['bedrock-account.regular'] = {
  id: 'bedrock-account.regular',
  label: 'Account Test Role',
  comment: 'Role for Test User',
  sysPermission: [
    permissions.ACCOUNT_ACCESS.id,
    permissions.ACCOUNT_UPDATE.id,
    permissions.ACCOUNT_INSERT.id
  ]
};

roles['bedrock-account.admin'] = {
  id: 'bedrock-account.admin',
  label: 'Account Test Role',
  comment: 'Role for Admin User',
  sysPermission: [
    permissions.ACCOUNT_ACCESS.id,
    permissions.ACCOUNT_UPDATE.id,
    permissions.ACCOUNT_INSERT.id,
    permissions.ACCOUNT_REMOVE.id,
    permissions.ACCOUNT_META_UPDATE.id
  ]
};
