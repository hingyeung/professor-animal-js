'use strict';

const AnimalGenie = require('./animal_genie');

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
    console.dir(event.result.action);
    console.dir(event.result.contexts);
    console.dir(event.result.parameters);
    console.dir(context);

    let animalGenie = new AnimalGenie();
    animalGenie.play(event, callback);

    // or
    // callback("some error type");
};
