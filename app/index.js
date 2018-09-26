"use strict";

const bodyParser = require("body-parser"),
    serverless = require("serverless-http"),
    createAnimalGenieApp = require("./CreateAnimalGenieApp"),
    express = require("express"),
    expressApp = express(),
    path = process.env.AWS_SAM_LOCAL ? "/apiaiwebhook" : "/v1/apiaiwebhook";

expressApp.use(bodyParser.json());
expressApp.post(path, createAnimalGenieApp);

console.log("preparing lambda");
exports.myHandler = serverless(expressApp);
