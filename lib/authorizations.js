/*!
 * Copyright (c) 2019-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import forwarded from 'forwarded';
import {verify} from '@bedrock/turnstile';

const {config, util: {BedrockError}} = bedrock;

export async function authorizeRegistration({req}) {
  const cfg = config['account-http'];
  const {authorizationRequired} = cfg.registration;
  const {authorization} = req.body;
  if(authorization?.type !== authorizationRequired) {
    throw new BedrockError(
      `Authorization using "${authorizationRequired}" is required.`, {
        name: 'NotAllowedError',
        details: {
          httpStatusCode: 403,
          public: true
        }
      });
  }

  // the first IP in the sourceAddresses array will *always* be the IP
  // reported by Express.js via `req.connection.remoteAddress`. Any additional
  // IPs will be from the `x-forwarded-for` header.
  const sourceAddresses = forwarded(req);

  // to get the end users IP adddress, use first IP from the `x-forwarded-for`
  // header
  const remoteIp = sourceAddresses[1];
  await verify({token: authorization.token, remoteIp});
}

