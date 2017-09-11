'use strict';

let fs = require('fs'),
    _ = require('lodash'),
    UserSession = require('./models/UserSession'),
    AnimalRepo = require('./services/animal_repo'),
    QuestionSelector = require('./services/question_selector'),
    DbService = require('./services/DbService');

const animalRepo = new AnimalRepo();

function AnimalGenie() {

}

AnimalGenie.prototype.play = function (event) {
    let animalsToPlayWith = [], userSession, nextQuestion,
        dbService = new DbService();

    if (_.includes(event.result.contexts, 'ReadyToPlay')) {
        animalsToPlayWith = loadFullAnimalListFromFile();
        userSession = new UserSession(event.sessionId,
            animalRepo.convertAnimalListToAnimalNameList(animalsToPlayWith));
        dbService.saveSession(userSession);
    } else {
        userSession = dbService.getSession(event.sessionId);
        animalsToPlayWith = animalRepo.convertAnimalNameListToAnimalList(userSession.animalNames);
    }
    nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith);
};

function loadFullAnimalListFromFile() {
    return animalRepo.allAnimals();
}

module.exports = AnimalGenie;