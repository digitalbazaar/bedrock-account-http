/*!
 * Copyright (c) 2019-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {agent} from '@bedrock/https-agent';
import {httpClient} from '@digitalbazaar/http-client';

const {config, util: {BedrockError}} = bedrock;

export async function authorizeRegistration({req}) {
  const cfg = config['account-http'];
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
  const cfg = config['account-http'];
  const {SECRET_KEY, url} = cfg.authorization.turnstile;

  const payload = {
    secret: SECRET_KEY,
    response: token,
    remoteip
  };

  try {
    const result = await httpClient.post(url, {agent, json: payload});
    if(result.data.success) {
      // captcha was successful, do nothing
      return;
    }
    throw new Error('Unsuccessful turnstile captcha.');
  } catch(cause) {
    throw new BedrockError('Unable to complete request, please try again.', {
      name: 'NotAllowedError',
      cause,
      details: {
        httpStatusCode: 405,
        public: true
      }
    });
  }
}
