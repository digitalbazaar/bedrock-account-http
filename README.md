# bedrock-account-http
HTTP APIs for Bedrock User Accounts

## Meter creation policies

The `config['account-http'].accountPolicies` map controls meter creation
grants for specific account IDs. Set `config['account-http'].useAccountPolicy`
to `true` to use meter grants from `@bedrock/account` as the base. This option
requires `@bedrock/account` 10.2.0 or later.

Each product grant in the per-account map takes precedence, including explicit
denials. With core policy enabled, products omitted from the map use the core
grant. By default, the per-account map supplies all grants.
