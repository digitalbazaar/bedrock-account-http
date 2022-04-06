/*!
 * Copyright (c) 2016-2022 Digital Bazaar, Inc. All rights reserved.
 */
import sinon from 'sinon';
import {passport} from '@bedrock/passport';
global.passportStub = sinon.stub(passport, 'authenticate');

import * as bedrock from '@bedrock/core';
import '@bedrock/account';
import '@bedrock/account-http';
import '@bedrock/mongodb';
import '@bedrock/test';

bedrock.start();
