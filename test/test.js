/*!
 * Copyright (c) 2016-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {passport} from '@bedrock/passport';
import sinon from 'sinon';
global.passportStub = sinon.stub(passport, 'authenticate');

import * as bedrock from '@bedrock/core';
import '@bedrock/account';
import '@bedrock/account-http';
import '@bedrock/mongodb';
import '@bedrock/test';

bedrock.start();
