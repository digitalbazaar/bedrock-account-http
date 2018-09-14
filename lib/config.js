/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');

const cfg = config['account-http'] = {};

cfg.routes = {
  basePath: '/accounts'
};

// TODO: implement validation
// common validation schemas
//config.validation.schema.paths.push(
//  path.join(__dirname, '..', 'schemas'));
