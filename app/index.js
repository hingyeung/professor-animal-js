'use strict';

var fs = require('fs');

exports.myHandler = function (event, context, callback) {
    var contents = fs.readFileSync('./data/animals.json', 'utf8');

    callback(null, JSON.parse(contents));
    // or
    // callback("some error type");
};