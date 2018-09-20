'use strict';

const AnimalGenie = require('./animal_genie'),
    AnimalRepo = require('./services/animal_repo');

// exports.myHandler = function (event, context, callback) {
//     console.dir(event.result.action);
//     console.dir(event.result.contexts);
//     console.dir(event.result.parameters);
//
//     let animalRepo = new AnimalRepo();
//     animalRepo.loadAnimals()
//         .then((fullAnimalList) => {
//             new AnimalGenie(fullAnimalList).play(event, callback, );
//         })
//         .catch((err) => {
//             console.log('Error loading animal definition', err);
//         })
//         .done();
//
//     // or
//     // callback("some error type");
// };

const createAnimalGenieApp = function (request, response) {
    const animalRepo = new AnimalRepo();
    animalRepo.loadAnimals()
        .then(fullAnimalList => {
            console.log('animals.json loaded');
            const animalGenie = new AnimalGenie(fullAnimalList);
            const options = {
                notificationTopicArn: process.env.NOTIFICATION_TOPIC_ARN
            };
            animalGenie.playByIntent(request, response, options);
        })
        .catch(err => {
            console.log('Error loading animal definition', err);
        })
        .done();

    // or
    // callback("some error type");
};

exports.createAnimalGenieApp = createAnimalGenieApp;