'use strict';

const AnimalGenie = require('./animal_genie'),
    {getLogger} = require('./services/logger_utils'),
    AnimalRepo = require('./services/animal_repo');

const logger = getLogger();

const createAnimalGenieApp = function (request, response) {
    const animalRepo = new AnimalRepo();
    animalRepo.loadAnimals()
        .then(fullAnimalList => {
            logger.info('animals.json loaded');
            const animalGenie = new AnimalGenie(fullAnimalList);
            const options = {
                notificationTopicArn: process.env.NOTIFICATION_TOPIC_ARN
            };
            animalGenie.playByIntent(request, response, options);
        })
        .catch(err => {
            logger.info('Error loading animal definition %s', err);
        })
        .done();
};

module.exports = createAnimalGenieApp;