'use strict';

const AnimalGenie = require('./animal_genie'),
    AnimalRepo = require('./services/animal_repo');

exports.myHandler = function (event, context, callback) {
    console.dir(event.result.action);
    console.dir(event.result.contexts);
    console.dir(event.result.parameters);
    console.dir(context);

    let animalRepo = new AnimalRepo();
    animalRepo.loadAnimals()
        .then((fullAnimalList) => {
            new AnimalGenie(fullAnimalList).play(event, callback, {
                notificationTopicArn: process.env.NOTIFICATION_TOPIC_ARN
            });
        })
        .catch((err) => {
            console.log('Error loading animal definition', err);
        })
        .done();

    // or
    // callback("some error type");
};
