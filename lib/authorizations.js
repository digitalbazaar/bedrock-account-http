/*!
 * Copyright (c) 2019-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {httpClient} from '@digitalbazaar/http-client';

const {config, util: {BedrockError}} = bedrock;
const cfg = config['account-http'];

export async function authorizeRegistration({req}) {
  const {authorizationRequired} = cfg.registration;
  const {authorization} = req.body;
  if(!(authorization?.type === authorizationRequired &&
      authorization.token)) {
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
  await _verifyTurnstileToken({token: authorization.token, remoteIp});
}

async function _verifyTurnstileToken({token, remoteip}) {
  const {SECRET_KEY, url} = cfg.authorization.turnstile;

  const payload = {
    secret: SECRET_KEY,
    response: token,
    remoteip
  };

  try {
    const result = await httpClient.post(url, {json: payload});
    if(result.data.success) {
      // captcha was successful, do nothing
      return;
    }
    throw new BedrockError('Unable to complete request, please try again.',
      'NotAllowedError', {
        httpStatusCode: 405,
        public: true,
      });
  } catch(e) {
    throw new BedrockError('Unable to complete request, please try again.',
      'NotAllowedError', {
        httpStatusCode: 405,
        public: true,
      });
  }
}
