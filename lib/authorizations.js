/*!
 * Copyright (c) 2019-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import verifyTurnstileToken from '@bedrock/turnstile';

const {config, util: {BedrockError}} = bedrock;

export async function authorizeRegistration({req}) {
  const cfg = config['account-http'];
  const {authorizationRequired} = cfg.registration;
  const {authorization} = req.body;
  if(!(authorization?.type === authorizationRequired)) {
    throw new BedrockError(
      `Authorization using "${authorizationRequired}" is required.`, {
        name: 'NotAllowedError',
        details: {
          httpStatusCode: 403,
          public: true
        }
      });
  }

  const remoteIp = req.socket.remoteAddress;
  await verifyTurnstileToken({token: authorization.token, remoteIp});
}

