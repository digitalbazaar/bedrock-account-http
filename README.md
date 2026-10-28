# bedrock-account-http
HTTP APIs for Bedrock User Accounts

## Registration authorization

Set `config['account-http'].registration.authorizationRequired` to a method name
or an array of method names. A registration request must use one enabled method.
Set it to `false` to allow registration without authorization.

```js
config['account-http'].registration.authorizationRequired =
  ['turnstile', 'oauth2'];
```

For Turnstile, include `authorization: {type: 'turnstile', token}` in the account
creation body. Configure verification through `@bedrock/turnstile`.

For OAuth2, set the trusted issuer's metadata URL:

```js
config['account-http'].registration.oauth2.issuerConfigUrl =
  'https://bedrock.dev/.well-known/oauth-authorization-server';
```

Send the token in the `Authorization: Bearer <token>` header and include
`authorization: {type: 'oauth2'}` in the account creation body. The token's audience
must match `config.server.baseUri`. Its scope must permit writing to the account
registration route, for example `write:/accounts` for the default route.
The verifier uses the `allowedAlgorithms` and `maxClockSkew` options from
`config['account-http'].registration.oauth2`.

A successful authorization stores `{type: 'turnstile'}` or `{type: 'oauth2'}` in
`meta.registration`. Retrieve the account record through `@bedrock/account` or
the authenticated single-account HTTP endpoint to read that metadata.

## Account policies

`getAccountPolicy({id})` reads the stored account and returns its configured
policy. An entry in `config['account-http'].accountPolicies` takes precedence over
all defaults. An empty policy or a product set to `false` keeps its meaning.
Policies are selected as complete objects, without merging grants.

Set `config['account-http'].accountPolicyDefaults` to choose policies for other
accounts:

```js
const cfg = config['account-http'];
cfg.accountPolicyDefaults.registration.turnstile = {
  meters: {create: {'<basic-product-id>': true}}
};
cfg.accountPolicyDefaults.registration.oauth2 = {
  meters: {create: {'<authorized-product-id>': true}}
};
cfg.accountPolicyDefaults.legacy = {
  createdBefore: Date.parse('2026-01-01T00:00:00Z'),
  policy: {meters: {create: {'<existing-product-id>': true}}}
};
```

The cutoff is a Unix timestamp in milliseconds. Choose the deployment's actual
cutoff. The older-account policy applies only when `meta.registration` is absent
and the server-recorded `meta.created` is strictly before that cutoff. A verified
registration method uses its configured policy, regardless of account age.
An unknown or unconfigured registration method uses
`accountPolicyDefaults.default`, which is an empty policy by default.

The resolver returns a copy without storing the computed policy. The account
meter creation route uses the resolved policy's `meters.create` product grants.
A missing or false grant denies meter creation.
