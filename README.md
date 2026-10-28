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
