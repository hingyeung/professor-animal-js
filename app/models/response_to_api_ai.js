'use strict';

const Question = require('./question'),
    _ = require('lodash'),
    Context = require('./context');

const DEFAULT_WELCOME_INTENT_PREFIX = "DefaultWelcomeIntent";

let ResponseFromApiAi = {
    fromQuestion: fromQuestion,
    repeatSpeechFromUserSesssion: repeatSpeechFromUserSesssion,
    answerGlossaryEnquiry: answerGlossaryEnquiry,
    answerUnknownGlossaryEnquiry: answerUnknownGlossaryEnquiry
};

function repeatSpeechFromUserSesssion(userSession, apiAiEvent) {
    let response = buildApiAiResponse(userSession.speech, userSession.speech);

    // copy contextIn to contextOut
    copyInContextToOutContext(response, apiAiEvent);

    return response;
}

function removeDefaultWelcomeContext(contextsOut) {
    return _.filter(contextsOut, (context) => {
        return (context.name && !context.name.startsWith(DEFAULT_WELCOME_INTENT_PREFIX));
    });
}

function fromQuestion(question, additionalContextOut) {
    // https://discuss.api.ai/t/webhook-response/786
    // Don't have empty list and object.
    let response = buildApiAiResponse(question.toText(), question.toText());

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
        response.contextOut = _.compact(contextOutForQuestion.concat(
            removeDefaultWelcomeContext(additionalContextOut)
        ));
    }
    return response;
}

function answerGlossaryEnquiry(term, definition, apiAiEvent) {
    return buildSimpleSpeechApiAiResponse(`<speak>${definition}<break time="1s"/> Should we continue?</speak>`, apiAiEvent);
}

function answerUnknownGlossaryEnquiry(term, apiAiEvent) {
    return buildSimpleSpeechApiAiResponse(`<speak>I am sorry but I don't much about ${term}.<break time="1s"/> Should we continue?</speak>`, apiAiEvent);
}

function buildSimpleSpeechApiAiResponse(speech, apiAiEvent) {
    let response = buildApiAiResponse(speech, stripSSMLTags(speech));
    copyInContextToOutContext(response, apiAiEvent);

    return response;
}

function buildApiAiResponse(speech, displayText) {
    return {
        speech: speech,
        displayText: displayText,
        source: "samuelli.net"
    };
}

function copyInContextToOutContext(response, apiAiEvent) {
    let contextOut = [];
    apiAiEvent.result.contexts.forEach(function (context) {
        contextOut.push(context);
    });

    if (contextOut.length > 0) {
        response.contextOut = contextOut;
    }
}

function stripSSMLTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();
    return str.replace(/<[^>]*>/g, '');
}

module.exports = ResponseFromApiAi;