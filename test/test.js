/*!
 * Copyright (c) 2016-2019 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const sinon = require('sinon');
const brPassport = require('bedrock-passport');
global.passportStub = sinon.stub(brPassport, 'optionallyAuthenticated');
const bedrock = require('bedrock');
require('bedrock-account-http');

require('bedrock-test');
bedrock.start();
