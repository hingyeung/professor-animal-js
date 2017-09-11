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
    // console.dir(event);
    // console.dir(context);

    let animalGenie = new AnimalGenie();
    animalGenie.run(event);

    console.dir(event);
    console.log("sessionId" + event.sessionId);

    // or
    // callback("some error type");
};
