/*!
 * Copyright (c) 2019-2026 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {checkTargetScopedAccessToken} from '@bedrock/oauth2-verifier';
import forwarded from 'forwarded';
import {verify} from '@bedrock/turnstile';

const {config, util: {BedrockError}} = bedrock;

const AUTHORIZATION_TYPES = ['turnstile', 'oauth2'];

export async function authorizeRegistration({req}) {
  const {authorizationRequired, oauth2} = config['account-http'].registration;
  if(authorizationRequired === false || authorizationRequired === '' ||
    (Array.isArray(authorizationRequired) &&
    authorizationRequired.length === 0)) {
    return;
  }

  const types = Array.isArray(authorizationRequired) ?
    authorizationRequired : [authorizationRequired];
  if(!types.every(type => AUTHORIZATION_TYPES.includes(type))) {
    throw new BedrockError(
      'Invalid registration authorization configuration.', {
        name: 'InvalidStateError',
        details: {httpStatusCode: 500, public: false}
      });
  }

  const {authorization} = req.body;
  const {type} = authorization || {};
  if(!types.includes(type)) {
    throw new BedrockError(
      `Authorization using "${types.join('" or "')}" is required.`, {
        name: 'NotAllowedError',
        details: {
          httpStatusCode: 403,
          public: true,
          actual: type,
          expected: types
        }
      });
  }

  if(type === 'oauth2') {
    const {issuerConfigUrl, allowedAlgorithms, maxClockSkew} = oauth2 ?? {};
    if(typeof issuerConfigUrl !== 'string' || issuerConfigUrl.length === 0) {
      throw new BedrockError(
        'An OAuth2 issuer configuration URL is required.', {
          name: 'InvalidStateError',
          details: {httpStatusCode: 500, public: false}
        });
    }
    const {baseUri, host} = config.server;
    const {basePath} = config['account-http'].routes;
    await checkTargetScopedAccessToken({
      req, issuerConfigUrl, audience: baseUri, allowedAlgorithms, maxClockSkew,
      getExpectedValues: () => ({
        host,
        rootInvocationTarget: baseUri,
        action: 'write',
        target: `${baseUri}${basePath}`
      })
    });
    return {type};
  }

  // the first IP in the sourceAddresses array will *always* be the IP
  // reported by Express.js via `req.connection.remoteAddress`. Any additional
  // IPs will be from the `x-forwarded-for` header.
  const sourceAddresses = forwarded(req);

  // to get the end users IP adddress, use last IP in the array from the
  // `x-forwarded-for' header
  const remoteIp = sourceAddresses.at(-1);
  await verify({token: authorization.token, remoteIp});
  return {type};
}
