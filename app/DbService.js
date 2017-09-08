'use strict';

var AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient({});
AWS.config.loadFromPath('./config.json');

function DbService() {
}

DbService.prototype.getItem = function (id, callback) {
    console.log('in GETITEM');
    docClient.get(
        {
            Key: {
                "id": "123"
            },
            // ProjectionExpression: 'ATTRIBUTE_NAME',
            TableName: "AnimalGenieUserSession"
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


module.exports = DbService;