'use strict';

const USER_SESSION_TABLE = "AnimalGenieUserSession",
    AWS = require('aws-sdk'),
    docClient = new AWS.DynamoDB.DocumentClient({});

AWS.config.loadFromPath('../config.json');

function DbService() {
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