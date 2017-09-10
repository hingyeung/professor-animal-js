'use strict';

var fs = require('fs'),
    _ = require('lodash'),
    AnimalRepo = require('./services/animal_repo'),
    DbService = require('./services/DbService');

exports.myHandler = function (event, context, callback) {
    // var contents = fs.readFileSync('./data/animals.json', 'utf8');
    // var dbService = new DbService();
    // dbService.saveSession({id: "456", animals: ["x", "y"]}, function(err, data) {
    //     if (err) {
    //         callback(err, null);
    //     } else {
    //         callback(null, data);
    //     }
    // });
    // console.dir(event);
    // console.dir(context);

    let animalsToPlayWith = [];
    console.dir(event);
    console.log("sessionId" + event.sessionId);

    if (_.includes(event.result.contexts, 'ReadyToPlay')) {
        animalsToPlayWith = loadFullAnimalListFromFile();
        console.dir(animalsToPlayWith);
    }

    // or
    // callback("some error type");
};

function loadFullAnimalListFromFile() {
    return (new AnimalRepo()).allAnimals();
}