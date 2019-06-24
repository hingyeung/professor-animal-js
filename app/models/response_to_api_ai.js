"use strict";

const Question = require("./question"),
    _ = require("lodash"),
    Context = require("./context");

const DEFAULT_WELCOME_INTENT_PREFIX = "DefaultWelcomeIntent",
    FIELD_PREFIX = "question-field--",
    CHOSEN_VALUE_PREFIX = "question-chosenvalue--";

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
            contextOutForQuestion = addFieldAndChosenValueInContext(contextOutForQuestion, question.field, question.chosenValue);
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
            setLifespanForFieldAndChosenValueContextToZero(
                setLifespanForDefaultWelcomeContextToZero(additionalContextOut)
            )
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
    console.log(`Speech to user: ${speech}`);
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
    contextOut = contextsIn.map(context => {
        if (context.lifespan === undefined) {
            return new Context(context.name, 1);
        } else {
            return context;
        }
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

function setLifespanForFieldAndChosenValueContextToZero(contextsOut) {
    return _.map(contextsOut, context => {
        if (context.name && (context.name.startsWith(FIELD_PREFIX) || context.name.startsWith(CHOSEN_VALUE_PREFIX))) {
            return new Context(context.name, 0);
        } else {
            return context;
        }
    });
}

function addFieldAndChosenValueInContext(oldContext, field, chosenValue) {
    return _.concat(
        oldContext,
        new Context("ingame", 1),
        new Context(FIELD_PREFIX + field, 1),
        new Context(CHOSEN_VALUE_PREFIX + escapeSpecialChars(chosenValue), 1)
    );
}

module.exports = ResponseFromApiAi;