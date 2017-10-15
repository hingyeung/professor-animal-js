'use strict';

const USER_SESSION_TABLE = "AnimalGenieUserSession",
    AWS = require('aws-sdk'),
    Q = require('q'),
    path = require('path');

const SECONDS_IN_A_DAY = 24 * 60 * 60,
    MILLISECONDS_IN_A_SECOND = 1000;

let docClient;

function DbService() {
    AWS.config.loadFromPath(path.join(__dirname, `../configs/${process.env.NODE_ENV}/config.json`));
    docClient = new AWS.DynamoDB.DocumentClient({});
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