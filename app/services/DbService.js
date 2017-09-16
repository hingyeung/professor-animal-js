'use strict';

const USER_SESSION_TABLE = "AnimalGenieUserSession",
    AWS = require('aws-sdk'),
    Q = require('q'),
    path = require('path');

let docClient;

function DbService() {
    AWS.config.loadFromPath(path.join(__dirname, '../config.json'));
    docClient = new AWS.DynamoDB.DocumentClient({});
}

DbService.prototype.getSession = function (id, callback) {
    let deferred = Q.defer();
    docClient.get(
        {
            Key: {
                "id": "123"
            },
            TableName: USER_SESSION_TABLE
        }, function (err, data) {
            if (err) {
                console.log("database error", err);
                deferred.reject(new Error(err));
            } else {
                console.dir(data);
                deferred.resolve(data);
            }
        });
    return deferred.promise;
};

DbService.prototype.saveSession = function (userSession) {
    let deferred = Q.defer();
    docClient.put({
        TableName: USER_SESSION_TABLE,
        Item: userSession
    }, function (err, data) {
        if (err) {
            console.log("database error", err);
            deferred.reject(new Error(err));
        } else {
            console.log("success", data);
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};


module.exports = DbService;