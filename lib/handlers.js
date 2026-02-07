/*!
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import assert from 'assert-plus';

const {util: {BedrockError}} = bedrock;

const HANDLERS = {
  /**
   * @function createMeter
   * @param {object} options - The meter creation options.
   * @param {object} options.meter - The meter to create.
   * @description Called to create a meter after a meter policy check has
   * been passed.
   */
  createMeter: null
};

export function setCreateMeterHandler({handler} = {}) {
  assert.func(handler, 'handler');
  _checkHandlerNotSet({name: 'createMeter', handler: HANDLERS.createMeter});
  HANDLERS.createMeter = handler;
}

// expose HANDLERS for testing and internal use only
export const _HANDLERS = HANDLERS;

function _checkHandlerNotSet({name, handler}) {
  // can only set handlers once
  if(handler) {
    throw new BedrockError(
      `Account HTTP handler "${name}" already set.`, {
        name: 'DuplicateError',
        details: {name}
      });
  }
}
