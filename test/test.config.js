/*!
 * Copyright (c) 2012-2019 Digital Bazaar, Inc. All rights reserved.
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

roles['bedrock-identity.regular'] = {
  id: 'bedrock-identity.regular',
  label: 'Identity Test Role',
  comment: 'Role for Test User',
  sysPermission: [
    permissions.IDENTITY_ACCESS.id,
    permissions.IDENTITY_UPDATE.id,
    permissions.IDENTITY_INSERT.id,
    permissions.IDENTITY_UPDATE_MEMBERSHIP.id,
    permissions.IDENTITY_CAPABILITY_DELEGATE.id,
    permissions.IDENTITY_CAPABILITY_REVOKE.id
  ]
};
roles['bedrock-identity.admin'] = {
  id: 'bedrock-identity.admin',
  label: 'Identity Test Role',
  comment: 'Role for Admin User',
  sysPermission: [
    permissions.IDENTITY_ACCESS.id,
    permissions.IDENTITY_UPDATE.id,
    permissions.IDENTITY_INSERT.id,
    permissions.IDENTITY_REMOVE.id,
    permissions.IDENTITY_META_UPDATE.id,
    permissions.IDENTITY_UPDATE_MEMBERSHIP.id,
    permissions.IDENTITY_CAPABILITY_DELEGATE.id,
    permissions.IDENTITY_CAPABILITY_REVOKE.id
  ]
};
