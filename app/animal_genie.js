'use strict';

let fs = require('fs'),
    _ = require('lodash'),
    AnimalFilter = require('./services/animal_filter'),
    Context = require('./models/context'),
    UserSession = require('./models/UserSession'),
    AnimalRepo = require('./services/animal_repo'),
    Question = require('./models/question'),
    QuestionSelector = require('./services/question_selector'),
    ResponseToApiAi = require('./models/response_to_api_ai'),
    Q = require('q'),
    GlossaryRepo = require('./services/glossary_repo'),
    DbService = require('./services/DbService'),
    AWS = require('aws-sdk');

const animalRepo = new AnimalRepo();

function AnimalGenie() {

}

AnimalGenie.prototype.play = function (event, callback, options) {
    let userSession, nextQuestion,
        dbService = new DbService();

    if (event.result.action === 'startgame') {
        // this is a new game, get the next question using animals from data file.
        loadFullAnimalListFromFile()
            .then(function() {
                let animalsToPlayWith = getLoadedFullAnimalList();
                console.dir(animalsToPlayWith);
                nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith, []);
                let responseToApiAi = ResponseToApiAi.fromQuestion(nextQuestion);
                userSession = new UserSession(event.sessionId,
                    animalRepo.convertAnimalListToAnimalNameList(animalsToPlayWith), nextQuestion.field, nextQuestion.chosenValue, [], responseToApiAi.speech);
                dbService.saveSession(userSession).then(function () {
                    console.dir(nextQuestion);
                    callback(null, responseToApiAi);
                }).catch(function (err) {
                    callback(err, buildErrorResponseToApiAi(err));
                }).done();
            })
            .catch((err) => {
                // TODO: handle this error
                console.log(`Error reading animal definition from s3://${process.env.DATA_S3_BUCKET}/${process.env.ANIMAL_DEFINITION_S3_KEY}`, err);
                callback("Unknown action: " + event.result.action, buildErrorResponseToApiAi(null));
            })
            .done();
    } else if (event.result.action === "answer_question") {
        loadSession(event.sessionId)
            .then(getNextQuestion(event))
            .then(updateSession)
            .then(responseToClient(callback))
            .catch(responseErrorToClient(callback))
            .done();
    } else if (event.result.action === 'answer_question_repeat') {
        loadSession(event.sessionId)
            .then(buildResponseToApiAiForRepeatingLastSpeech(event, callback))
            .done();
    } else if (event.result.action === 'answer_question_glossary_enquiry') {
      buildSpeechForAnsweringGlossaryEnquiry(event, callback);
    } else if (event.result.action === 'computer_made_incorrect_guess') {
      notifyIncorrectGuess(event.result.parameters.animal, options.notificationTopicArn);
    } else {
        callback("Unknown action: " + event.result.action, buildErrorResponseToApiAi(null));
    }
};

function buildSpeechForAnsweringGlossaryEnquiry(event, callback) {
    let term = event.result.parameters.term,
        glossaryRepo = new GlossaryRepo();
    let definition = glossaryRepo.getDefinition(term);
    if (definition) {
        callback(null, ResponseToApiAi.answerGlossaryEnquiry(term, definition, event));
    } else {
        callback(null, ResponseToApiAi.answerUnknownGlossaryEnquiry(term, definition));
    }
}

function buildResponseToApiAiForRepeatingLastSpeech(event, callback) {
    return function (userSession) {
        callback(null, ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, event));
    };
}

function responseErrorToClient(callback) {
    return function (err) {
        callback(err, buildErrorResponseToApiAi(err));
    };
}

function loadSession(sessionId) {
    return (new DbService()).getSession(sessionId);
}

function updateSession(contextForNextRound) {
    let dbService = new DbService(),
        deferred = Q.defer(),
        nextQuestion = contextForNextRound.nextQuestion,
        userSession = contextForNextRound.userSession;

    if (nextQuestion.questionType === "filter_based_question") {
        userSession.field = nextQuestion.field;
        userSession.chosenValue = nextQuestion.chosenValue;
        userSession.animalNames = animalRepo.convertAnimalListToAnimalNameList(contextForNextRound.animalsForNextRound);
        userSession.fieldAndAttributeValuesToIgnore = contextForNextRound.fieldAndAttributeValuesToIgnore;
    }
    userSession.speech = nextQuestion.toText();

    dbService.saveSession(userSession)
        .then(function () {
            deferred.resolve(nextQuestion);
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
}

function getNextQuestion(event) {
    return function (userSession) {
        let fieldAndAttributeValuesToIgnore, nextQuestion;
        let answer = event.result.parameters.answer;
        let animalsToPlayWith = animalRepo.convertAnimalNameListToAnimalList(userSession.animalNames);
        // filter animalsToPlayWith before determining the next question
        animalsToPlayWith = AnimalFilter.filter(animalsToPlayWith, answer === "yes", userSession.field, userSession.chosenValue);
        console.log('animals remaining: ', animalRepo.convertAnimalListToAnimalNameList(animalsToPlayWith));

        if (animalsToPlayWith.length === 1) {
            fieldAndAttributeValuesToIgnore = [];
            nextQuestion = new Question(null, null, animalsToPlayWith[0].name, "ready_to_guess_question");
            userSession.speech = nextQuestion.toText();
        } else {

            // if the answer is "yes", the attribute needs to be ignored during the generation of
            // the next question to avoid infinity loop (always pick the most popular attribute, which
            // remain the same.
            fieldAndAttributeValuesToIgnore = userSession.fieldAndAttributeValuesToIgnore;
            if (answer === 'yes') {
                fieldAndAttributeValuesToIgnore.push({
                    field: userSession.field,
                    attributeValue: userSession.chosenValue
                });
            }

            nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith, fieldAndAttributeValuesToIgnore);
            userSession.speech = nextQuestion.toText();
            console.log("Next question to ask: ", nextQuestion.toText());
        }
        return {
            nextQuestion: nextQuestion,
            userSession: userSession,
            animalsForNextRound: animalsToPlayWith,
            fieldAndAttributeValuesToIgnore: fieldAndAttributeValuesToIgnore
        };
    };
}

function responseToClient(callback) {
    return function (nextQuestion) {
        callback(null, ResponseToApiAi.fromQuestion(nextQuestion));
    };
}

function loadFullAnimalListFromFile() {
    return animalRepo.loadAnimals();
}

function getLoadedFullAnimalList() {
    return animalRepo.allAnimals();
}

// TODO return error and reset the game
function buildErrorResponseToApiAi(err) {
    console.log('ERROR', err);
    return null;
}

function notifyIncorrectGuess(animal, topicArn) {
  let sns = new AWS.SNS();
  console.dir(topicArn);
  let params = {
    Message: 'Professor Animal has made an incorrect guess. The answer was ' + animal,
    Subject: 'Professor Animal has just lost a game.',
    TopicArn: topicArn
  };
  sns.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });
}

module.exports = AnimalGenie;