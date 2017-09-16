'use strict';

let fs = require('fs'),
    _ = require('lodash'),
    AnimalFilter = require('./services/animal_filter'),
    Context = require('./models/context'),
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
        return ResponseToApiAi.fromQuestion(nextQuestion, [new Context("ingame", 1)]);
    } else if (event.result.action === "answer_question") {
        dbService.getSession(event.sessionId).then(function (userSession) {
            let answer = event.parameters.answer;
            animalsToPlayWith = animalRepo.convertAnimalNameListToAnimalList(userSession.animalNames);
            // filter animalsToPlayWith before determining the next question
            animalsToPlayWith = AnimalFilter.filter(animalsToPlayWith, answer === "yes", userSession.field, userSession.chosenValue);
            nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith);
            return ResponseToApiAi.fromQuestion(nextQuestion, [new Context("ingame", 1)]);
        });
    }
};

function loadFullAnimalListFromFile() {
    return animalRepo.allAnimals();
}

module.exports = AnimalGenie;