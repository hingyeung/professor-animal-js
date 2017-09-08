'use strict';

const USER_SESSION_TABLE = "AnimalGenieUserSession";
var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({});
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
                console.log("I got AN ERROR!");
                console.error(err);
                callback(err, null);
            } else {
                console.log(data);
                console.dir(data);
                console.log("I got this from the database!!!");
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