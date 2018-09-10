'use strict';

const bodyParser = require('body-parser'),
    serverless = require('serverless-http'),
    {createAnimalGenieApp} = require('./CreateAnimalGenieApp'),
    express = require('express');

const expressApp = express();
expressApp.use(bodyParser.json());
expressApp.post('/apiaiwebhook', createAnimalGenieApp);

console.log('preparing lambda');

exports.myHandler = serverless(expressApp);

// exports.myHandler = function(event, context, callback) {
//     console.log('in lambda');
//     callback(null, {body: 'success', statusCode: 200});
// };

// exports.myHandler({}, {}, () => {});