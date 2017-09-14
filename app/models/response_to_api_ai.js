'use strict';

let ResponseFromApiAi = {
    fromQuestion: fromQuestion
};

function fromQuestion(question) {
    // https://discuss.api.ai/t/webhook-response/786
    // Don't have empty list and object.
    return {
        speech: question.toText(),
        displayText: question.toText(),
        source: "samuelli.net"
    };
}

module.exports = ResponseFromApiAi;