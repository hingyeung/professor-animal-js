'use strict';

const AnimalGenie = require('./animal_genie'),
    AnimalRepo = require('./services/animal_repo');

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
};

module.exports = createAnimalGenieApp;