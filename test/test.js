/*!
 * Copyright (c) 2016-2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const sinon = require('sinon');
const {passport} = require('bedrock-passport');
global.passportStub = sinon.stub(passport, 'authenticate');
const bedrock = require('bedrock');
require('bedrock-account');
require('bedrock-account-http');
require('bedrock-mongodb');

require('bedrock-test');
bedrock.start();
