/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as brAccount from 'bedrock-account';
import * as validators from '../schemas/bedrock-account-http.js';
import {asyncHandler} from 'bedrock-express';
import bedrock from 'bedrock';
import boolParser from 'express-query-boolean';
import {createValidateMiddleware} from 'bedrock-validation';
import intParser from 'express-query-int';
import {ensureAuthenticated, optionallyAuthenticated} from 'bedrock-passport';

const {config, util: {uuid, BedrockError}} = bedrock;

// load config defaults
import './config.js';

bedrock.events.on('bedrock-session-http.session.get', (req, session) => {
  // if user is authenticated, include account ID in session
  if(req.user && req.user.account) {
    session.account = {id: req.user.account.id};
  }
});

bedrock.events.on('bedrock-express.configure.routes', app => {
  const cfg = config['account-http'];
  const {basePath} = cfg.routes;
  const accountPath = basePath + '/:account';
  const {baseUri} = bedrock.config.server;

  app.post(
    basePath,
    // only check authn to establish whether to auto-login or not; anyone can
    // create a new account
    optionallyAuthenticated,
    createValidateMiddleware({bodySchema: validators.create()}),
    asyncHandler(async (req, res, next) => {
      const account = {
        id: 'urn:uuid:' + uuid(),
        email: req.body.email
      };
      const meta = {};

      // anyone may create a new account; must be rate limited via another
      // means if necessary
      await brAccount.insert({account, meta});

      // get location for new account
      const location = `${baseUri}/${encodeURIComponent(account.id)}`;

      if(req.user || !cfg.autoLoginNewAccounts) {
        // if user already logged into another account or auto-login disabled,
        // do not auto-login the new account
        res.status(201).location(location).json(account);
        return;
      }

      // auto-login
      const user = {account};
      // TODO: if passport supports promises or this can be safely promisified
      // then do that in the future; (note that passport's `logIn` signature
      // actually takes 3 params with one being optional and is not used here)
      // ...include using promises within the callback here
      req.logIn(user, err => {
        if(err) {
          return next(err);
        }
        // emit auto-login event for extensions to implement additional
        // behavior after first account login
        bedrock.events.emit('bedrock-account-http.autoLogin', {
          req, res, account
        }).then(
          () => res.status(201).location(location).json(account),
          next);
      });
    }));

  app.get(
    basePath,
    boolParser(),
    intParser(),
    optionallyAuthenticated,
    createValidateMiddleware({querySchema: validators.get()}),
    asyncHandler(async (req, res) => {
      /**
       * @function getAccounts
       * @param {object} req - The request.
       * @param {object} res - The response.
       * @param {object} req.query - The request query.
       * @param {string} req.query.email - Required to acces this route.
       * @param {boolean} req.query.exists - Used by registration.
       * @param {string} req.query.cursor - An account id.
       * @description Gets account records (or checks for their existence).
       * Visitors (not logged in) can confirm an email exists
       * Authenticated account can get its own account info via email
       * ZCAP-authorized can list accounts by email (Not implemented).
       */
      if(req.query.exists === true) {
        // allow anyone to check for account existence
        const {email} = req.query;
        const exists = await brAccount.exists({email});
        if(exists) {
          return res.status(200).end();
        }
        throw new BedrockError(
          'Account does not exist.', 'NotFoundError', {
            httpStatusCode: 404,
            public: true,
          });
      }

      // unauthenticated users must pass `exists` param
      if(!(req.user && req.user.account)) {
        throw new BedrockError(
          'The "exists" query parameter must be passed.',
          'NotAllowedError', {
            httpStatusCode: 403,
            public: true
          });
      }

      const {email/*, after = null*/} = req.query;
      const query = {'account.email': email};
      // only support searches on authenticated account
      query['account.id'] = req.user.account.id;
      /*if(after) {
        query['account.id'] = {$gt: after};
      }*/
      const options = {
        sort: {'account.id': -1},
        projection: {
          _id: 0,
          account: 1,
          'meta.created': 1,
          'meta.sequence': 1,
          'meta.status': 1
        }
      };
      const records = await brAccount.getAll({query, options});
      res.json(records);
    }));

  app.post(
    `${accountPath}/status`,
    ensureAuthenticated,
    createValidateMiddleware({bodySchema: validators.setStatus()}),
    asyncHandler(async (req, res) => {
      /**
       * @function setStatus
       * @param {object} req - The request.
       * @param {object} res - The response.
       * @description - Takes an account id from the route
       * and a status in the req.body and
       * changes that status in the account's meta
       * possible statuses are active, disabled, and deleted.
       */
      const {account: id} = req.params;
      _checkAccount({req, id});
      const {status} = req.body;
      await brAccount.setStatus({status, id});
      res.status(204).send();
    })
  );

  app.patch(
    accountPath,
    ensureAuthenticated,
    intParser(),
    createValidateMiddleware({bodySchema: validators.update()}),
    asyncHandler(async (req, res) => {
      /**
      * @function accountUpdateHandler
      * @param {object} req - The request.
      * @param {object} res - The response.
      * @param {Function} next
      * @description Patch requests to /:account result in an updated account
      * patches need to be in the:
      * [json patch format]{@link https://tools.ietf.org/html/rfc6902}
      * [we use fast-json]{@link https://www.npmjs.com/package/fast-json-patch}
      * for handling json patches.
      * The body needs to contains the id, patch, and sequence keys.
      */
      const {account: id} = req.params;
      _checkAccount({req, id});
      const updater = {id, ...req.body};
      await brAccount.update(updater);
      res.status(204).send();
    }));

  app.get(
    accountPath,
    ensureAuthenticated,
    asyncHandler(async (req, res) => {
      const {account: id} = req.params;
      _checkAccount({req, id});
      const record = await brAccount.get({id});
      res.json(record);
    }));

  app.delete(
    accountPath,
    ensureAuthenticated,
    asyncHandler(async (req, res) => {
      const {account: id} = req.params;
      _checkAccount({req, id});
      await brAccount.setStatus({status: 'deleted', id});
      res.status(204).send();
    }));
});

function _checkAccount({req, id}) {
  if(!(req.user && req.user.account && req.user.account.id === id)) {
    throw new BedrockError(
      'The authenticated account does not match the target account.',
      'NotAllowedError', {
        httpStatusCode: 403,
        public: true
      });
  }
}
