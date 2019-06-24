"use strict";

const bodyParser = require("body-parser"),
    serverless = require("serverless-http"),
    createAnimalGenieApp = require("./CreateAnimalGenieApp"),
    express = require("express"),
    expressApp = express(),
    path = process.env.AWS_SAM_LOCAL ? "/apiaiwebhook" : "/v1/apiaiwebhook",
    {getLogger} = require('./services/logger_utils');

const logger = getLogger();

expressApp.use(bodyParser.json());
expressApp.post(path, createAnimalGenieApp);

logger.info("preparing lambda");
exports.myHandler = serverless(expressApp);
