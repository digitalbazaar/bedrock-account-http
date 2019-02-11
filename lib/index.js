/*!
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const asyncHandler = require('express-async-handler');
const bedrock = require('bedrock');
const {config, util: {BedrockError}} = bedrock;
const cors = require('cors');
require('bedrock-express');
const brAccount = require('bedrock-account');
const brPassport = require('bedrock-passport');
const {
  ensureAuthenticated,
  optionallyAuthenticated
} = brPassport;
const uuid = require('uuid/v4');
const {validate} = require('bedrock-validation');
// FIXME add an implementation in bedrock-express
const boolParser = require('express-query-boolean');
const intParser = require('express-query-int');

// load config defaults
require('./config');

// module API
const api = {};
module.exports = api;

// const logger = bedrock.loggers.get('app').child('bedrock-account-http');

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
    optionallyAuthenticated,
    validate('account.create'),
    asyncHandler(async (req, res) => {
      const account = {
        id: 'urn:uuid:' + uuid(),
        email: req.body.email
      };
      const meta = {
        sysResourceRole: [{
          sysRole: 'account.registered',
          resource: [account.id]
        }]
      };
      // actor is not required, but passed through if given
      const {actor = null} = req.user || {};
      await brAccount.insert({actor, account, meta});
      res.status(201).location(baseUri + '/' + account.id).json(account);
    }));

  app.get(
    basePath,
    optionallyAuthenticated,
    // FIXME add an implementation in bedrock-express
    boolParser(),
    intParser(),
    validate({query: 'account.get'}),
    asyncHandler(async (req, res) => {
      /**
       * @func getAccounts
       * @param {Request} req
       * @param {Response} res
       * @param {Object} req.query
       * @param {String} req.query.email - required to acces this route
       * @param {Boolean} req.query.exists - used by Registration
       * @param {Number} req.query.limit
       * @param  {String} req.query.cursor - an account id
       * @description Gets account records (or checks for their existence).
       * Visitors (not logged in) can confirm an email exists
       * Admins (logged in) can list accounts by email
       */
      if(req.query.exists === true) {
        // allow anyone to check for account existence
        const {email} = req.query;
        const exists = await brAccount.exists({actor: null, email});
        if(exists) {
          return res.status(200).end();
        }
        // TODO: improve error details
        throw new BedrockError(
          'Account does not exist.', 'NotFoundError', {
            httpStatusCode: 404,
            public: true,
          });
      }
      const {email, after = null, limit = 10} = req.query;
      const {actor} = req.user || {};
      const query = {'account.email': email};
      if(after) {
        query['account.id'] = {$gt: after};
      }
      const fields = {
        'account': 1,
        'meta.created': 1,
        'meta.sequence': 1,
        'meta.status': 1,
        'meta.sysResourceRole': 1
      };
      const options = {limit, sort: {'account.id': -1}};
      const records = await brAccount.getAll({actor, query, fields, options});
      res.json(records);
    }));

  app.post(
    `${accountPath}/status`,
    ensureAuthenticated,
    validate('account.setStatus'),
    asyncHandler(async (req, res) => {
      /**
       * @func setStatus
       * @param {Request} req
       * @param {Response} res
       * @description - takes an account id from the route
       * and a status in the req.body and
       * changes that status in the account's meta
       * possible statuses are active and deleted
       * @route /:account/status
       */
      const {account: id} = req.params;
      const {actor} = req.user || {};
      const {status} = req.body;
      await brAccount.setStatus({actor, status, id});
      res.status(204).send();
    })
  );

  app.patch(
    accountPath,
    ensureAuthenticated,
    intParser(),
    validate('account.update'),
    asyncHandler(async (req, res) => {
      /**
      * @function accountUpdateHandler
      * @param {Request} req
      * @param {Response} res
      * @param {Function} next
      * @description patch requests to /:account result in an updated account
      * patches need to be in the:
      * [json patch format]{@link https://tools.ietf.org/html/rfc6902}
      * [we use fast-json]{@link https://www.npmjs.com/package/fast-json-patch}
      * for handling json patches.
      * The body needs to contains the id, patch, and sequence keys
      */
      const {actor} = req.user || {};
      const {account: id} = req.params;
      const updater = {actor, id, ...req.body};
      await brAccount.update(updater);
      res.status(204).send();
    }));

  app.options(accountPath, cors());

  app.get(
    `${accountPath}/roles`,
    ensureAuthenticated,
    cors(),
    asyncHandler(async (req, res) => {
      /**
       * @func getCapabilitiesForAnAccount
       * @param {Request} req
       * @param {Response} res
       * @description uses the account param to get
       * all the capabilities for an account
       * @route /:account/roles
       */
      const {account: id} = req.params;
      const record = await brAccount.getCapabilities({id});
      res.json(record);
    }));

  app.get(
    accountPath,
    optionallyAuthenticated,
    cors(),
    asyncHandler(async (req, res) => {
      const {account: id} = req.params;
      const {actor} = req.user || {};
      const record = await brAccount.get({actor, id});
      res.json(record);
    }));

  app.delete(
    accountPath,
    ensureAuthenticated,
    asyncHandler(async (req, res, next) => {
      // TODO: next
      next();
    }));
});
