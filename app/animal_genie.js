'use strict';

let fs = require('fs'),
    _ = require('lodash'),
    AnimalFilter = require('./services/animal_filter'),
    Context = require('./models/context'),
    UserSession = require('./models/UserSession'),
    AnimalRepo = require('./services/animal_repo'),
    QuestionSelector = require('./services/question_selector'),
    ResponseToApiAi = require('./models/response_to_api_ai'),
    Q = require('q'),
    DbService = require('./services/DbService');

const animalRepo = new AnimalRepo();

function AnimalGenie() {

}

AnimalGenie.prototype.play = function (event, callback) {
    let animalsToPlayWith = [], userSession, nextQuestion,
        dbService = new DbService();

    if (event.result.action === 'startgame') {
        // this is a new game, get the next question using animals from data file.
        animalsToPlayWith = loadFullAnimalListFromFile();
        nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith);
        userSession = new UserSession(event.sessionId,
                    animalRepo.convertAnimalListToAnimalNameList(animalsToPlayWith), nextQuestion.field, nextQuestion.chosenValue);
        dbService.saveSession(userSession).then(function() {
            console.dir(nextQuestion);
            callback(null, ResponseToApiAi.fromQuestion(nextQuestion, [new Context("ingame", 1)]));
        }).catch(function(err) {
            callback(err, buildErrorResponseToApiAi(err));
        }).done();

    } else if (event.result.action === "answer_question") {
        dbService.getSession(event.sessionId).then(function (userSession) {
            let answer = event.result.parameters.answer;
            animalsToPlayWith = animalRepo.convertAnimalNameListToAnimalList(userSession.animalNames);
            // filter animalsToPlayWith before determining the next question
            animalsToPlayWith = AnimalFilter.filter(animalsToPlayWith, answer === "yes", userSession.field, userSession.chosenValue);
            nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith);
            console.dir(nextQuestion);
            callback(null, ResponseToApiAi.fromQuestion(nextQuestion, [new Context("ingame", 1)]));
        }).catch(function (err) {
            callback(err, buildErrorResponseToApiAi(err));
        }).done();
    } else {
        callback("Unknown action: " + event.result.action, buildErrorResponseToApiAi(null));
    }
};

function loadFullAnimalListFromFile() {
    return animalRepo.allAnimals();
}

// TODO return error and reset the game
function buildErrorResponseToApiAi(err) {
    console.log('ERROR', err);
    return null;
}

module.exports = AnimalGenie;