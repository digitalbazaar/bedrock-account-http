/*!
 * Copyright (c) 2019-2026 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cfg = config['account-http'] = {
  // account registration options
  registration: {
    // default to false, set name of service as string
    authorizationRequired: false
  }
};

cfg.routes = {
  basePath: '/accounts'
};

cfg.autoLoginNewAccounts = false;

// use core policy for meter grants as the base for per-account overrides
cfg.useAccountPolicy = false;

cfg.accountPolicies = {
  /*
  "<accountId>": {
    "meters": {
      "<policyAction, e.g., `create`>": {
        "<productId>": true|false
      }
    }
  }
  */
};

config.validation.schema.paths.push(path.join(__dirname, '..', 'schemas'));
