'use strict';

let ResponseFromApiAi = {
    fromQuestion: fromQuestion
};

function fromQuestion(question, contextOut) {
    // https://discuss.api.ai/t/webhook-response/786
    // Don't have empty list and object.
    let response = {
        speech: question.toText(),
        displayText: question.toText(),
        source: "samuelli.net"
    };
    if (Array.isArray(contextOut) && contextOut.length > 0) {
        response.contextOut = contextOut;
    }
    return response;
}

module.exports = ResponseFromApiAi;