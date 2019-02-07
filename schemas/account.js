const {schemas} = require('bedrock-validation');

const create = {
  title: 'bedrock-accounts-http account creation post',
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: schemas.email()
  }
};

const pagination = {
  title: 'bedrock-accounts-http pagination',
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: schemas.email(),
    cursor: {
      type: 'string',
      minLength: 0
    },
    limit: {
      type: 'number',
      minimum: 1,
      maximum: 1000
    }
  }
};

const Update = {
  title: 'bedrock-accounts-http account update',
  required: ['patch', 'sequence'],
  type: 'object',
  additionalProperties: false,
  properties: {
    patch: schemas.jsonPatch(),
    sequence: {
      type: 'number',
      minimum: 0
    }
  }
};

const getAccountsQuery = {
  title: 'bedrock-accounts-http account exists get',
  required: ['email', 'exists'],
  additionalProperties: false,
  type: 'object',
  properties: {
    email: schemas.email(),
    exists: {
      type: 'boolean'
    }
  }
};

module.exports.create = () => create;
module.exports.getAccountsQuery = () => getAccountsQuery;
module.exports.pagination = () => pagination;
module.exports.getAccountsQuery = () => getAccountsQuery;
module.exports.update = () => Update;
