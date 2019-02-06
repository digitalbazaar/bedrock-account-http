const {schemas} = require('bedrock-validation');

const byEmail = {
  title: 'bedrock-accounts-http account creation post',
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: schemas.email()
  }
};

const Pagination = {
  title: 'bedrock-accounts-http pagination',
  type: 'object',
  required: ['email'],
  additionalPropeties: false,
  properties: {
    email: schemas.email(),
    cursor: {
      type: 'number',
      minimum: 0
    },
    limit: {
      type: 'number',
      minimum: 10,
      maximum: 1000
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

module.exports.byEmail = () => byEmail;
module.exports.getAccountsQuery = () => getAccountsQuery;
module.exports.pagination = () => Pagination;
module.exports.getAccountsQuery = () => getAccountsQuery;
