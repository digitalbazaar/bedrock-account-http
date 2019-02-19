'use strict';
/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';
const path = require('path');
const {config} = require('bedrock');

const cfg = config['account-http'] = {};

cfg.routes = {
  basePath: '/accounts'
};

config.validation.schema.paths.push(
  path.join(__dirname, '..', 'schemas')
);
