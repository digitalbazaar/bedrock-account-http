/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {schemas} = require('bedrock-validation');

exports.create = () => ({
  title: 'bedrock-accounts-http account creation post',
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: schemas.email()
  }
});

exports.get = () => ({
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
});

exports.update = () => ({
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
});

exports.setStatus = () => ({
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
});
