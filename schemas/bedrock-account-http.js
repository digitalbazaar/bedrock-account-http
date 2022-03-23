/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {schemas} from 'bedrock-validation';

export function create() {
  return {
    title: 'bedrock-accounts-http account creation post',
    type: 'object',
    required: ['email'],
    additionalProperties: false,
    properties: {
      email: schemas.email()
    }
  };
}

export function get() {
  return {
    title: 'bedrock-accounts-http get',
    type: 'object',
    required: ['email'],
    additionalProperties: false,
    properties: {
      email: schemas.email(),
      exists: {
        type: 'boolean'
      },
      after: {
        type: 'string',
        minLength: 0
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 1000
      }
    }
  };
}

export function update() {
  return {
    title: 'bedrock-accounts-http account update',
    required: ['patch', 'sequence'],
    type: 'object',
    additionalProperties: false,
    properties: {
      patch: schemas.jsonPatch(),
      sequence: {
        type: 'integer',
        minimum: 0
      }
    }
  };
}

export function setStatus() {
  return {
    title: 'bedrock-accounts-http patch set status',
    required: ['status'],
    type: 'object',
    additionalProperties: false,
    properties: {
      status: {
        type: 'string',
        enum: ['active', 'disabled', 'deleted']
      }
    }
  };
}
