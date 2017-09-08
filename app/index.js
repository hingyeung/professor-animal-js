'use strict';

var fs = require('fs'),
    DbService = require('./DbService');

exports.myHandler = function (event, context, callback) {
    var contents = fs.readFileSync('./data/animals.json', 'utf8');
    var dbService = new DbService();
    dbService.getItem("123", function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
    // console.dir(event);
    // console.dir(context);


    // or
    // callback("some error type");
};