const {schemas} = require('bedrock-validation');

const postAccounts = {
  title: 'bedrock-accounts-http account creation post',
  type: 'object',
  required: ['email'],
  email: schemas.email()
};

const getAccountsQuery = {
  title: 'bedrock-accounts-http account exists get',
  required: ['email', 'exists'],
  email: schemas.email(),
  exists: {
    type: 'boolean'
  }
};

module.exports.postAccounts = () => postAccounts;
module.exports.getAccountsQuery = () => getAccountsQuery;
