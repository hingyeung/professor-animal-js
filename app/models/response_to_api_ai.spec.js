'use strict';

const ResponseToApiAi = require('./response_to_api_ai'),
    should = require('chai').should(),
    Context = require('./context'),
    Question = require('./question');

describe('ResponseFromApiAi', function () {
    it('should convert filter based question to response object without contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A", Question.FILTER_BASED_QUESTION);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question, [new Context('ingame', 1)])
        );
    });

    it('should convert ready-to-guess question to response object without contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A", Question.READY_TO_GUESS_QUESTION);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question, [new Context('readytoguess', 1)])
        );
    });

    it('should convert give-up question to response object without contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A", Question.GIVE_UP_MESSAGE);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question, [new Context('giveup', 1)])
        );
    });

    it('should convert question to response object with additional contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A");
        ResponseToApiAi.fromQuestion(question, [new Context("name", 1)]).should.deep.equal(
            buildExpectedContextOut(question, [new Context('ingame', 1), new Context('name', 1)])
        );
    });
});

function buildExpectedContextOut(question, contextOut) {
    return {
        speech: question.toText(),
        displayText: question.toText(),
        source: "samuelli.net",
        contextOut: contextOut
    };
}