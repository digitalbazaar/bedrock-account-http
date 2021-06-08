/*!
 * Copyright (c) 2019-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const path = require('path');
const {config} = require('bedrock');

const cfg = config['account-http'] = {};

cfg.routes = {
  basePath: '/accounts'
};

cfg.autoLoginNewAccounts = false;

config.validation.schema.paths.push(
  path.join(__dirname, '..', 'schemas')
);
