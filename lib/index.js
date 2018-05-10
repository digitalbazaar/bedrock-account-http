/*
 * Copyright (c) 2018 Digital Bazaar, Inc. All rights reserved.
 */
const asyncHandler = require('express-async-handler');
const bedrock = require('bedrock');
const {config} = bedrock;
const cors = require('cors');
require('bedrock-express');
const brAccount = require('bedrock-account');
const brPassport = require('bedrock-passport');
const {
  ensureAuthenticated,
  optionallyAuthenticated
} = brPassport;
const uuid = require('uuid/v4');

// load config defaults
require('./config');

// module API
const api = {};
module.exports = api;

const logger = bedrock.loggers.get('app').child('bedrock-account-http');

bedrock.events.on('bedrock-express.configure.routes', app => {
  const cfg = config['account-http'];
  const {basePath} = cfg.routes;
  const accountPath = basePath + '/:account';
  const {baseUri} = bedrock.config.server;

  app.post(
    basePath,
    optionallyAuthenticated,
    // TODO: validate('services.account.postAccounts')
    asyncHandler(async (req, res) => {
      const account = {
        id: uuid(),
        email: req.body.email
      };
      // actor is not required, but passed through if given
      await brAccount.insert({actor: req.user.actor || null, account});
      res.status(201).location(baseUri + '/' + account.id).end();
    }));

  app.get(
    basePath,
    optionallyAuthenticated,
    //validate({query: 'services.account.getAccountsQuery'}),
    asyncHandler(async (req, res, next) => {
      const {account: id} = req.params;
      if(req.query.exists === 'true' && req.query.email) {
        // allow anyone to check for account existence
        const {email} = req.query;
        const exists = await brAccount.exists({actor: null, email});
        if(exists) {
          return res.status(200).end();
        }
        return res.status(404).end();
      }
      // TODO: call `brAccount.getAll`
      next();
    }));

  app.patch(
    accountPath,
    ensureAuthenticated,
    asyncHandler(async (req, res, next) => {
      // TODO: call `brAccount.update`
      next();
    }));

  app.options(accountPath, cors());
  app.get(
    accountPath,
    optionallyAuthenticated,
    cors(),
    asyncHandler(async (req, res) => {
      const {account: id} = req.params;
      const record = await brAccount.get({actor: req.user.actor, id});
      res.status(200).json(record);
    }));

  app.delete(
    accountPath,
    ensureAuthenticated,
    asyncHandler(async (req, res, next) => {
      // TODO: next
      next();
    }));
});
