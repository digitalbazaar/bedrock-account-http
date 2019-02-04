const email = {
  type: 'string'
};

const postAccounts = {
  title: 'bedrock-accounts-http account creation post',
  required: ['email'],
  email
};

const getAccountsQuery = {
  title: 'bedrock-accounts-http account exists get',
  required: ['email', 'exists'],
  email,
  exists: {
    type: 'boolean'
  }
};

module.exports.postAccounts = () => postAccounts;
module.exports.getAccountsQuery = () => getAccountsQuery;
