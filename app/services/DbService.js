'use strict';

const USER_SESSION_TABLE = process.env.USER_SESSION_TABLE,
    AWS = require('aws-sdk'),
    Q = require('q');

const SECONDS_IN_A_DAY = 24 * 60 * 60,
    MILLISECONDS_IN_A_SECOND = 1000;

let docClient;

function DbService() {

    let options = {};
    if (process.env.AWS_SAM_LOCAL) {
        let config = require(`../configs/${process.env.NODE_ENV}/config.json`);
        options.endpoint = config.dynamodbEndpoint;
    }
    docClient = new AWS.DynamoDB.DocumentClient(options);
}

DbService.prototype.getSession = function (id) {
    let deferred = Q.defer();
    docClient.get(
        {
            Key: {
                "id": id
            },
            TableName: USER_SESSION_TABLE
        }, function (err, data) {
            if (err) {
                console.log("getSession error", err);
                deferred.reject(new Error(err));
            } else {
                console.log("getSession success", data.Item);
                deferred.resolve(data.Item);
            }
        });
    return deferred.promise;
};

DbService.prototype.saveSession = function (userSession) {
    let deferred = Q.defer();

    function nowInSeconds() {
        return Math.trunc(new Date().getTime() / MILLISECONDS_IN_A_SECOND);
    }

    // zero is still a proper time
    if (userSession.creationTime === undefined || userSession.creationTime === null) {
        userSession.creationTime = nowInSeconds();
    }
    userSession.lastUpdatedTime = nowInSeconds();
    userSession.expirationTime = userSession.lastUpdatedTime + SECONDS_IN_A_DAY;

    docClient.put({
        TableName: USER_SESSION_TABLE,
        Item: userSession
    }, function (err, data) {
        if (err) {
            console.log("saveSession error", err);
            deferred.reject(new Error(err));
        } else {
            console.log("saveSession success", data);
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};


module.exports = DbService;