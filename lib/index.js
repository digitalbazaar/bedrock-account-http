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
  const adminPath = basePath + '/admin';
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
    validate({query: 'account.getAccountsQuery'}),
    asyncHandler(async (req, res) => {
      if(req.query.exists === true && req.query.email) {
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
      // TODO: call `brAccount.getAll`
      // TODO: improve error details
      throw new BedrockError(
        'Account does not exist.', 'NotFoundError', {
          httpStatusCode: 404,
          public: true,
        });
    }));

  app.get(
    adminPath,
    ensureAuthenticated,
    intParser(),
    validate({query: 'account.pagination'}),
    asyncHandler(async (req, res) => {
      const {email, cursor = null, limit = 10} = req.query;
      const {actor} = req.user || {};
      const query = {'account.email': email};
      if(cursor) {
        query['account.id'] = {$gt: cursor};
      }
      const options = {limit, sort: {'account.id': -1}};
      const records = await brAccount.getAll({actor, query, options});
      res.status(200).json(records);
    }));

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
       * [json patch]{@link https://www.npmjs.com/package/fast-json-patch}
       * format. The body needs to contains the id, patch, and sequence keys
       */
      const {actor} = req.user || {};
      const {account: id} = req.params;
      const updater = {
        actor,
        id,
        ...req.body
      };
      await brAccount.update(updater);
      res.status(200).send();
    }));

  app.options(accountPath, cors());

  app.get(
    accountPath,
    optionallyAuthenticated,
    cors(),
    asyncHandler(async (req, res) => {
      const {account: id} = req.params;
      const {actor} = req.user || {};
      const record = await brAccount.get({actor, id});
      res.status(200).json(record);
    })
  );

  app.delete(
    accountPath,
    ensureAuthenticated,
    asyncHandler(async (req, res, next) => {
      // TODO: next
      next();
    }));
});
