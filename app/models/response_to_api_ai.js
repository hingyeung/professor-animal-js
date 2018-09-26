"use strict";

const Question = require("./question"),
    _ = require("lodash"),
    Context = require("./context");

const DEFAULT_WELCOME_INTENT_PREFIX = "DefaultWelcomeIntent";

let ResponseFromApiAi = {
    fromQuestion: fromQuestion,
    repeatSpeechFromUserSesssion: repeatSpeechFromUserSesssion,
    answerGlossaryEnquiry: answerGlossaryEnquiry,
    answerUnknownGlossaryEnquiry: answerUnknownGlossaryEnquiry
};

function repeatSpeechFromUserSesssion(userSession, contextsIn) {
    let response = buildApiAiResponse(userSession.speech, userSession.speech);

    // copy contextIn to contextOut
    copyInContextToOutContext(response, contextsIn);

    return response;
}

function setLifespanForDefaultWelcomeContextToZero(contextsOut) {
    return _.map(contextsOut, (context) => {
        // the output context set by an intent will not be unset by your webhook code
        // unless you explicitly do it by setting its lifespan to zero
        return context.name && context.name.toLowerCase().startsWith(DEFAULT_WELCOME_INTENT_PREFIX.toLowerCase()) ?
            new Context(context.name, 0):
            new Context(context.name, context.lifespan);
    });
}

function escapeSpecialChars(str) {
    return str !== undefined ? str.replace(/[^a-zA-Z0-9+]/g, "-") : "";
}

function fromQuestion(question, additionalContextOut) {
    // https://discuss.api.ai/t/webhook-response/786
    // Don't have empty list and object.
    let response = buildApiAiResponse(question.toText(), question.toText());

    let contextOutForQuestion = [];
    switch (question.questionType) {
        case Question.FILTER_BASED_QUESTION:
            contextOutForQuestion = _.concat(
                contextOutForQuestion,
                new Context("ingame", 1),
                new Context("question-field--" + question.field, 1),
                new Context("question-chosenValue--" + escapeSpecialChars(question.chosenValue), 1)
            );
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
            setLifespanForDefaultWelcomeContextToZero(additionalContextOut)
        )).sort((a,b) => a.name > b.name);
    }
    return response;
}

function answerGlossaryEnquiry(term, definition, contextsIn) {
    return buildSimpleSpeechApiAiResponse(`<speak>${definition}<break time="1s"/> Should we continue?</speak>`, contextsIn);
}

function answerUnknownGlossaryEnquiry(term, contextsIn) {
    return buildSimpleSpeechApiAiResponse(`<speak>I am sorry but I don't much about ${term || "that"}.<break time="1s"/> Should we continue?</speak>`, contextsIn);
}

function buildSimpleSpeechApiAiResponse(speech, contextsIn) {
    let response = buildApiAiResponse(speech, stripSSMLTags(speech));
    copyInContextToOutContext(response, contextsIn);

    return response;
}

function buildApiAiResponse(speech, displayText) {
    return {
        speech: speech,
        displayText: displayText,
        source: "samuelli.net"
    };
}

function copyInContextToOutContext(response, contextsIn) {
    if (!contextsIn) {
        return;
    }

    let contextOut = [];
    contextsIn.forEach(function (context) {
        contextOut.push(context);
    });

    if (contextOut.length > 0) {
        response.contextOut = contextOut;
    }
}

function stripSSMLTags(str) {
    if ((str === null) || (str === ""))
        return false;
    else
        str = str.toString();
    return str.replace(/<[^>]*>/g, "");
}

module.exports = ResponseFromApiAi;