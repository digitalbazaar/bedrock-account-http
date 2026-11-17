# bedrock-account-http
HTTP APIs for Bedrock User Accounts

## Meter creation policies

The `config['account-http'].accountPolicies` map controls meter creation
grants for specific account IDs. Set `config['account-http'].useAccountPolicy`
to `true` to use the policy from `@bedrock/account` for accounts without an
entry in the map. This option requires `@bedrock/account` 10.2.0 or later.

A configured per-account policy supplies all of that account's meter grants.
An empty policy denies meter creation.
