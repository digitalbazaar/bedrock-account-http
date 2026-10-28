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
    // false disables authorization, otherwise use a method name or array
    authorizationRequired: false,
    oauth2: {
      issuerConfigUrl: undefined,
      // maximum clock skew in seconds
      maxClockSkew: 300
    }
  }
};

cfg.routes = {
  basePath: '/accounts'
};

cfg.autoLoginNewAccounts = false;

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

cfg.accountPolicyDefaults = {
  registration: {},
  legacy: {
    // Unix timestamp in milliseconds. Undefined disables the cutoff.
    createdBefore: undefined,
    policy: {}
  },
  default: {}
};

config.validation.schema.paths.push(path.join(__dirname, '..', 'schemas'));
