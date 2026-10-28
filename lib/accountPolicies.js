/*!
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */
import * as brAccount from '@bedrock/account';
import {config, util} from '@bedrock/core';

const {BedrockError} = util;

/**
 * Gets the configured policy for an account.
 *
 * @param {object} options - The options to use.
 * @param {string} options.id - The account ID.
 *
 * @returns {Promise<object>} The account policy.
 */
export async function getAccountPolicy({id} = {}) {
  const {meta} = await brAccount.get({id});
  const {accountPolicies, accountPolicyDefaults} = config['account-http'];
  if(Object.hasOwn(accountPolicies, id)) {
    return structuredClone(accountPolicies[id]);
  }

  const {registration: registrationPolicies, legacy, default: defaultPolicy} =
    accountPolicyDefaults;
  const {registration, created} = meta;
  if(registration !== undefined) {
    const type = registration?.type;
    if(typeof type === 'string' && Object.hasOwn(registrationPolicies, type)) {
      return structuredClone(registrationPolicies[type]);
    }
    return structuredClone(defaultPolicy);
  }

  const {createdBefore, policy} = legacy;
  if(createdBefore !== undefined) {
    if(!Number.isSafeInteger(createdBefore) || createdBefore < 0) {
      throw new BedrockError('Invalid account policy cutoff.', {
        name: 'InvalidStateError',
        details: {
          httpStatusCode: 500,
          public: false,
          actual: createdBefore,
          expected: 'A non-negative integer Unix timestamp in milliseconds.'
        }
      });
    }
    // missing registration does not establish when the account was created
    if(Number.isSafeInteger(created) && created >= 0 &&
      created < createdBefore) {
      return structuredClone(policy);
    }
  }
  return structuredClone(defaultPolicy);
}
