'use strict';

const lambdaLocal = require('lambda-local'),
    path = require('path'),
    fs = require('fs');

console.log(__dirname);
const jsonPayload = require('./data/initial_request.js');

lambdaLocal.execute({
    event: jsonPayload,
    lambdaPath: path.join(__dirname, 'index.js'),
    profilePath: '~/.aws/credentials',
    profileName: 'default',
    lambdaHandler: 'myHandler',
    timeoutMs: 3000
}).then(function (done) {
    console.log(done);
}).catch(function (err) {
    console.log(err);
});