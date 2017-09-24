'use strict';

const Question = require('./question'),
    _ = require('lodash'),
    Context = require('./context');

let ResponseFromApiAi = {
    fromQuestion: fromQuestion,
    repeatSpeechFromUserSesssion: repeatSpeechFromUserSesssion
};

function repeatSpeechFromUserSesssion(userSession, apiAiEvent) {
    let response = {
        speech: userSession.speech,
        displayText: userSession.speech,
        source: "samuelli.net"
    };

    // copy contextIn to contextOut
    let contextOut = [];
    apiAiEvent.result.contexts.forEach(function (context) {
        contextOut.push(context);
    });

    if (contextOut.length > 0) {
        response.contextOut = contextOut;
    }

    return response;
}

function fromQuestion(question, additionalContextOut) {
    // https://discuss.api.ai/t/webhook-response/786
    // Don't have empty list and object.
    let response = {
        speech: question.toText(),
        displayText: question.toText(),
        source: "samuelli.net"
    };

    let contextOutForQuestion = [];
    switch (question.questionType) {
        case Question.FILTER_BASED_QUESTION:
            contextOutForQuestion.push(new Context("ingame", 1));
            break;
        case Question.GIVE_UP_MESSAGE:
            contextOutForQuestion.push(new Context("giveup", 1));
            break;
        case Question.READY_TO_GUESS_QUESTION:
            contextOutForQuestion.push(new Context("readytoguess", 1));
            break;
    }

    if (contextOutForQuestion.length > 0 || (Array.isArray(additionalContextOut) && additionalContextOut.length > 0)) {
        response.contextOut = _.compact(contextOutForQuestion.concat(additionalContextOut));
    }
    return response;
}

module.exports = ResponseFromApiAi;