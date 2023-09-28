/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';
import {fileURLToPath} from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cfg = config['account-http'] = {
  // account authorization type options
  authorization: {
    turnstile: {
      SECRET_KEY: '1x0000000000000000000000000000000AA',
      url: 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    }
  },
  // account registration options
  registration: {
    authorizationRequired: 'turnstile'
  }
};

cfg.routes = {
  basePath: '/accounts'
};

cfg.autoLoginNewAccounts = false;

config.validation.schema.paths.push(path.join(__dirname, '..', 'schemas'));
