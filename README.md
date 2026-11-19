# bedrock-account-http
HTTP APIs for Bedrock User Accounts

## Account policy

Set `config['account-http'].useAccountPolicy` to `true` to use the account's
policy. Each section in a per-account override replaces the matching section
of that policy.

The meter creation route checks `meters.create` for the requested product ID.
The commented `accounts` section illustrates a possible future policy.

```js
config['account-http'].accountPolicies = {
  '<accountId>': {
    // Future example:
    // accounts: {
    //   create: {},
    //   update: {}
    // },
    meters: {
      create: {
        '<productId>': true
      }
    }
  }
};
```
