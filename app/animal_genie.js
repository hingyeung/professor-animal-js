'use strict';

const fs = require('fs'),
    _ = require('lodash'),
    AnimalFilter = require('./services/animal_filter'),
    Context = require('./models/context'),
    UserSession = require('./models/UserSession'),
    Question = require('./models/question'),
    QuestionSelector = require('./services/question_selector'),
    ResponseToApiAi = require('./models/response_to_api_ai'),
    Q = require('q'),
    GlossaryRepo = require('./services/glossary_repo'),
    DbService = require('./services/DbService'),
    AnimalListUtils = require('./services/animal_list_utils'),
    AWS = require('aws-sdk');

function AnimalGenie(fullAnimalList) {
    this.fullAnimalList = fullAnimalList;
}

AnimalGenie.prototype.play = function (event, callback, options) {
    let userSession, nextQuestion,
        dbService = new DbService(),
        that = this;

    if (event.result.action === 'startgame') {
        let fullAnimalNameList = AnimalListUtils.convertAnimalListToAnimalNameList(that.fullAnimalList);
        // this is a new game, get the next question using animals from data file.
        console.log(fullAnimalNameList, fullAnimalNameList.length);
        nextQuestion = QuestionSelector.nextQuestion(that.fullAnimalList, []);
        let responseToApiAi = ResponseToApiAi.fromQuestion(nextQuestion);
        userSession = new UserSession(event.sessionId,
            fullAnimalNameList, nextQuestion.field, nextQuestion.chosenValue, [], responseToApiAi.speech);
        dbService.saveSession(userSession).then(function () {
            console.dir(nextQuestion);
            callback(null, responseToApiAi);
        }).catch(function (err) {
            callback(err, that.buildErrorResponseToApiAi(err));
        }).done();
    } else if (event.result.action === "answer_question") {
        that.loadSession(event.sessionId)
            .then(that.getNextQuestion(event))
            .then(that.updateSession)
            .then(that.responseToClient(callback))
            .catch(that.responseErrorToClient(callback))
            .done();
    } else if (event.result.action === 'answer_question_repeat') {
        that.loadSession(event.sessionId)
            .then(that.buildResponseToApiAiForRepeatingLastSpeech(event, callback))
            .done();
    } else if (event.result.action === 'answer_question_glossary_enquiry') {
        that.buildSpeechForAnsweringGlossaryEnquiry(event, callback);
    } else if (event.result.action === 'computer_made_incorrect_guess') {
        that.notifyIncorrectGuess(event.result.parameters.animal, options.notificationTopicArn);
    } else {
        callback("Unknown action: " + event.result.action, that.buildErrorResponseToApiAi(null));
    }
};

AnimalGenie.prototype.buildSpeechForAnsweringGlossaryEnquiry = function(event, callback) {
    let term = event.result.parameters.term,
        glossaryRepo = new GlossaryRepo();
    let definition = glossaryRepo.getDefinition(term);
    if (definition) {
        callback(null, ResponseToApiAi.answerGlossaryEnquiry(term, definition, event));
    } else {
        callback(null, ResponseToApiAi.answerUnknownGlossaryEnquiry(term, definition));
    }
};

AnimalGenie.prototype.buildResponseToApiAiForRepeatingLastSpeech = function(event, callback) {
    return function (userSession) {
        callback(null, ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, event));
    };
};

AnimalGenie.prototype.responseErrorToClient = function(callback) {
    let that = this;
    return function (err) {
        callback(err, that.buildErrorResponseToApiAi(err));
    };
};

AnimalGenie.prototype.loadSession = function(sessionId) {
    return (new DbService()).getSession(sessionId);
};

AnimalGenie.prototype.updateSession = function(contextForNextRound) {
    let dbService = new DbService(),
        deferred = Q.defer(),
        nextQuestion = contextForNextRound.nextQuestion,
        userSession = contextForNextRound.userSession;

    if (nextQuestion.questionType === "filter_based_question") {
        userSession.field = nextQuestion.field;
        userSession.chosenValue = nextQuestion.chosenValue;
        userSession.animalNames = AnimalListUtils.convertAnimalListToAnimalNameList(contextForNextRound.animalsForNextRound);
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
};

AnimalGenie.prototype.getNextQuestion = function(event) {
    let that = this;
    return function (userSession) {
        let fieldAndAttributeValuesToIgnore, nextQuestion;
        let answer = event.result.parameters.answer;
        let animalsToPlayWith = AnimalListUtils.convertAnimalNameListToAnimalList(userSession.animalNames, that.fullAnimalList);
        // filter animalsToPlayWith before determining the next question
        if (answer === "yes" || answer === "no") {
            animalsToPlayWith = AnimalFilter.filter(animalsToPlayWith, answer === "yes", userSession.field, userSession.chosenValue);
        }
        let animalNameList = AnimalListUtils.convertAnimalListToAnimalNameList(animalsToPlayWith);
        console.log('animals remaining: ', animalNameList, animalNameList.length);

        if (animalsToPlayWith.length === 1) {
            fieldAndAttributeValuesToIgnore = [];
            nextQuestion = new Question(null, null, animalsToPlayWith[0].name, "ready_to_guess_question");
            userSession.speech = nextQuestion.toText();
        } else {

            // if the answer is "yes", the attribute needs to be ignored during the generation of
            // the next question to avoid infinity loop (always pick the most popular attribute, which
            // remain the same.
            // Also ignored the attribute if player answered "not_sure" to avoid asking the same question
            fieldAndAttributeValuesToIgnore = userSession.fieldAndAttributeValuesToIgnore;
            if (answer === 'yes' || answer === "not_sure") {
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
};

AnimalGenie.prototype.responseToClient = function(callback) {
    return function (nextQuestion) {
        callback(null, ResponseToApiAi.fromQuestion(nextQuestion));
    };
};

// TODO return error and reset the game
AnimalGenie.prototype.buildErrorResponseToApiAi = function(err) {
    console.log('ERROR', err);
    return null;
};

AnimalGenie.prototype.notifyIncorrectGuess = function(animal, topicArn) {
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
};

module.exports = AnimalGenie;