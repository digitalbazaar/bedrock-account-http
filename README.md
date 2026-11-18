# bedrock-account-http
HTTP APIs for Bedrock User Accounts

## Meter creation policies

Set `config['account-http'].useAccountPolicy` to `true` to use the account's
meter grants. If a per-account override includes `meters`, it supplies all meter
grants for that account.
