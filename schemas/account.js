const services = {
  account: {
    postAccounts: {
      required: ['email']
    },
    getAccountsQuery: {

    }
  }
};

const email = {
  type: 'string'
};

const postAccounts = {
  title: 'bedrock-accounts-http account creation post',
  required: ['email'],
  email
};

module.exports.postAccounts = () => postAccounts;
