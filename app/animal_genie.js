'use strict';

let fs = require('fs'),
    _ = require('lodash'),
    UserSession = require('./models/UserSession'),
    AnimalRepo = require('./services/animal_repo'),
    DbService = require('./services/DbService');

const animalRepo = new AnimalRepo();

function AnimalGenie() {

}

AnimalGenie.prototype.play = function (event) {
    let animalsToPlayWith = [];
    if (_.includes(event.result.contexts, 'ReadyToPlay')) {
        animalsToPlayWith = loadFullAnimalListFromFile();
        let dbService = new DbService();
        dbService.saveSession(new UserSession(event.sessionId,
            animalRepo.convertAnimalListToAnimalNameList(animalsToPlayWith)));
    }
};

function loadFullAnimalListFromFile() {
    return animalRepo.allAnimals();
}

module.exports = AnimalGenie;