'use strict';

let fs = require('fs'),
    _ = require('lodash'),
    UserSession = require('./models/UserSession'),
    AnimalRepo = require('./services/animal_repo'),
    QuestionSelector = require('./services/question_selector'),
    ResponseToApiAi = require('./models/response_to_api_ai'),
    DbService = require('./services/DbService');

const animalRepo = new AnimalRepo();

function AnimalGenie() {

}

AnimalGenie.prototype.play = function (event) {
    let animalsToPlayWith = [], userSession, nextQuestion,
        dbService = new DbService();

    if (event.result.action === 'startgame') {
        animalsToPlayWith = loadFullAnimalListFromFile();
        userSession = new UserSession(event.sessionId,
            animalRepo.convertAnimalListToAnimalNameList(animalsToPlayWith));
        dbService.saveSession(userSession);
        nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith);
        return ResponseToApiAi.fromQuestion(nextQuestion);
    } else {
        dbService.getSession(event.sessionId).then(function (userSession) {
            animalsToPlayWith = animalRepo.convertAnimalNameListToAnimalList(userSession.animalNames);
            nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith);
            return ResponseToApiAi.fromQuestion(nextQuestion);
        });
    }
};

function loadFullAnimalListFromFile() {
    return animalRepo.allAnimals();
}

module.exports = AnimalGenie;