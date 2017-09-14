'use strict';

const ResponseToApiAi = require('./response_to_api_ai'),
    should = require('chai').should(),
    Question = require('./question');

describe('ResponseFromApiAi', function () {
    it('should convert question to response object to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A");
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            {
                speech: question.toText(),
                displayText: question.toText(),
                source: "samuelli.net"
            }
        );
    });
});