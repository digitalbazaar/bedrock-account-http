/*!
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import assert from 'assert-plus';

const {util: {BedrockError}} = bedrock;

const HANDLERS = {
  // this handler must be called when creating a new meter
  createMeter: null,
};

/* The createMeter is an optional handler for now. */
// bedrock.events.on('bedrock.start', async () => {
//   _checkHandlerSet({name: 'createMeter', handler: HANDLERS.createMeter});
// });

export function setCreateMeterHandler({handler} = {}) {
  assert.func(handler, 'handler');
  _checkHandlerNotSet({name: 'createMeter', handler: HANDLERS.createMeter});
  HANDLERS.createMeter = handler;
}

// expose HANDLERS for testing and internal use only
export const _HANDLERS = HANDLERS;

// function _checkHandlerSet({name, handler}) {
//   if(!handler) {
//     throw new BedrockError(
//       'Account HTTP handler not set.',
//       'InvalidStateError', {name});
//   }
// }

function _checkHandlerNotSet({name, handler}) {
  // can only set handlers once
  if(handler) {
    throw new BedrockError(
      'Account HTTP handler already set.',
      'DuplicateError', {name});
  }
}
