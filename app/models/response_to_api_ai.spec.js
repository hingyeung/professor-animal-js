'use strict';

const ResponseToApiAi = require('./response_to_api_ai'),
    should = require('chai').should(),
    Context = require('./context'),
    Question = require('./question');

describe('ResponseFromApiAi', function () {
    it('should convert question to response object without contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A");
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            {
                speech: question.toText(),
                displayText: question.toText(),
                source: "samuelli.net"
            }
        );
    });

    it('should convert question to response object with contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A");
        ResponseToApiAi.fromQuestion(question, [new Context("name", 1)]).should.deep.equal(
            {
                speech: question.toText(),
                displayText: question.toText(),
                source: "samuelli.net",
                contextOut: [{name: "name", lifespan: 1}]
            }
        );
    });
});