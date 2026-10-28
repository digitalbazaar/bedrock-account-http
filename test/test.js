/*!
 * Copyright (c) 2016-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {addOAuth2AuthzServer} from '@bedrock/basic-authz-server';
import '@bedrock/account';
import '@bedrock/account-http';
import '@bedrock/mongodb';
import '@bedrock/test';

bedrock.events.on('bedrock-express.configure.routes', app => {
  addOAuth2AuthzServer({app});
});

bedrock.start();
