/*!
 * Copyright (c) 2019-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {schemas} from '@bedrock/validation';

export function create() {
  return {
    title: 'Create Account',
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
    title: 'Get Accounts',
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
    title: 'Update Account',
    required: ['account', 'sequence'],
    type: 'object',
    additionalProperties: false,
    properties: {
      account: {
        title: 'Account',
        type: 'object',
        required: ['id', 'email'],
        additionalProperties: true,
        properties: {
          id: {
            type: 'string',
            minLength: 0
          },
          email: schemas.email()
        }
      },
      sequence: {
        type: 'integer',
        minimum: 0
      }
    }
  };
}

export function setStatus() {
  return {
    title: 'Set Account Status',
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
