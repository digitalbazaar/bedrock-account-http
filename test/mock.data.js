/*
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const helpers = require('./helpers');

const data = {};
module.exports = data;

const accounts = data.accounts = {};
let email;

email = 'will-be-updated@example.com';
accounts[email] = {};
accounts[email].account = helpers.createAccount(email);
accounts[email].meta = {};
accounts[email].meta.sysResourceRole = [{
  sysRole: 'bedrock-account.regular',
  generateResource: 'id'
}];

// regular permissions
email = 'alpha@example.com';
accounts[email] = {};
accounts[email].account = helpers.createAccount(email);
accounts[email].meta = {};
accounts[email].meta.sysResourceRole = [{
  sysRole: 'bedrock-account.regular',
  generateResource: 'id'
}];

// admin permissions
email = 'admin@example.com';
accounts[email] = {};
accounts[email].account = helpers.createAccount(email);
accounts[email].meta = {};
accounts[email].meta.sysResourceRole = [{
  sysRole: 'bedrock-account.admin'
}];

// multiple accounts one email
email = 'multi@example.com';
accounts[email] = {};
accounts[email].account = helpers.createAccount(email);
accounts[email + 2] = {};
accounts[email + 2].account = helpers.createAccount(email);
accounts[email + 3] = {};
accounts[email + 3].account = helpers.createAccount(email);
