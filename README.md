# bedrock-account-http
HTTP APIs for Bedrock User Accounts

## Meter creation policies

The `config['account-http'].accountPolicies` map controls meter creation
grants for specific account IDs. Set `config['account-http'].useAccountPolicy`
to `true` to use meter grants from `@bedrock/account` as the base. This option
requires `@bedrock/account` 10.2.0 or later.

Each top-level section in the override replaces the corresponding core
section. A `meters` override supplies all meter grants for the account.
If the override omits `meters`, the core grants apply when enabled.
