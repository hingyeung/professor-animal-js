'use strict';

const USER_SESSION_TABLE = "AnimalGenieUserSession",
    AWS = require('aws-sdk'),
    path = require('path');

let docClient;

function DbService() {
    AWS.config.loadFromPath(path.join(__dirname, '../config.json'));
    docClient = new AWS.DynamoDB.DocumentClient({});
}

DbService.prototype.getSession = function (id, callback) {
    docClient.get(
        {
            Key: {
                "id": "123"
            },
            TableName: USER_SESSION_TABLE
        }, function (err, data) {
            if (err) {
                console.error(err);
                callback(err, null);
            } else {
                console.dir(data);
                callback(null, data);
            }
        });
};

DbService.prototype.saveSession = function (userSession) {
    docClient.put({
        TableName: USER_SESSION_TABLE,
        Item: userSession
    }, function (err, data) {
        if (err) {
            console.log("error", err);
        } else {
            console.log("success", data);
        }
    });
};


module.exports = DbService;