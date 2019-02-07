const {schemas} = require('bedrock-validation');

const postAccounts = {
  title: 'bedrock-accounts-http account creation post',
  type: 'object',
  required: ['email'],
  additionalProperties: false,
  properties: {
    email: schemas.email()
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

const setStatus = {
  title: 'bedrock-accounts-http patch set status',
  required: ['status'],
  type: 'object',
  additionalProperties: false,
  properties: {
    status: {
      type: 'string',
      minLength: 6,
      maxLength: 7
    }
  }
};

module.exports.postAccounts = () => postAccounts;
module.exports.getAccountsQuery = () => getAccountsQuery;
module.exports.setStatus = () => setStatus;
