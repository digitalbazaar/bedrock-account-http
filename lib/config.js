/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from 'bedrock';
import {fileURLToPath} from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const cfg = config['account-http'] = {};

cfg.routes = {
  basePath: '/accounts'
};

cfg.autoLoginNewAccounts = false;

config.validation.schema.paths.push(path.join(__dirname, '..', 'schemas'));
