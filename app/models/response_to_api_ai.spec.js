'use strict';

const ResponseToApiAi = require('./response_to_api_ai'),
    should = require('chai').should(),
    Context = require('./context'),
    UserSession = require('../models/UserSession'),
    _ = require('lodash'),
    Question = require('./question');

describe('ResponseFromApiAi', function () {
    it('should convert filter based question to response object without contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A", Question.FILTER_BASED_QUESTION);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), [new Context('ingame', 1)])
        );
    });

    it('should convert ready-to-guess question to response object without contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A", Question.READY_TO_GUESS_QUESTION);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), [new Context('readytoguess', 1)])
        );
    });

    it('should convert give-up question to response object without contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A", Question.GIVE_UP_MESSAGE);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), [new Context('giveup', 1)])
        );
    });

    it('should convert question to response object with additional contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A");
        ResponseToApiAi.fromQuestion(question, [new Context("name", 1)]).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), [new Context('ingame', 1), new Context('name', 1)])
        );
    });

    it('should use speech saved in session when in-context is not set', function () {
        let userSession = new UserSession("123");
        userSession.speech = 'previous speech';
        let apiAiEvent = {
            result: {
                contexts: []
            }
        };
        ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, apiAiEvent).should.deep.equal({
            speech: "previous speech",
            displayText: "previous speech",
            source: "samuelli.net"
        });
    });

    it('should use speech saved in session when in-context is set', function () {
        let userSession = new UserSession("123");
        userSession.speech = 'previous speech';
        let apiAiEvent = {
            result: {
                contexts: [{name: "a", lifespan: 1}, {name: "b", lifespan: 2}]
            }
        };
        ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, apiAiEvent).should.deep.equal({
            speech: "previous speech",
            displayText: "previous speech",
            source: "samuelli.net",
            contextOut: [{name: "a", lifespan: 1}, {name: "b", lifespan: 2}]
        });
    });

    it('should convert glossary definition without in-context', function () {
        let apiAiEvent = {
            result: {
                contexts: []
            }
        };
        ResponseToApiAi.answerGlossaryEnquiry("A", "definition for A", apiAiEvent).should.deep.equal(
            buildExpectedContextOut("definition for A.<break time=\"1s\"/> Should we continue?", "definition for A. Should we continue?", null)
        );
    });

    it('should convert glossary definition with in-context', function () {
        let apiAiEvent = {
            result: {
                contexts: [{name: "a", lifespan: 1}, {name: "b", lifespan: 2}]
            }
        };
        ResponseToApiAi.answerGlossaryEnquiry("A", "definition for A", apiAiEvent).should.deep.equal(
            buildExpectedContextOut("definition for A.<break time=\"1s\"/> Should we continue?", "definition for A. Should we continue?", [{name: "a", lifespan: 1}, {name: "b", lifespan: 2}])
        );
    });

    it('should convert unknown glossary definition without in-context', function () {
        let apiAiEvent = {
            result: {
                contexts: []
            }
        };
        ResponseToApiAi.answerUnknownGlossaryEnquiry("A", apiAiEvent).should.deep.equal(
            buildExpectedContextOut("I am sorry but I don't much about A.<break time=\"1s\"/> Should we continue?", "I am sorry but I don't much about A. Should we continue?", null)
        );
    });

    it('should convert unknown glossary definition with in-context', function () {
        let apiAiEvent = {
            result: {
                contexts: [{name: "a", lifespan: 1}, {name: "b", lifespan: 2}]
            }
        };
        ResponseToApiAi.answerUnknownGlossaryEnquiry("A", apiAiEvent).should.deep.equal(
            buildExpectedContextOut("I am sorry but I don't much about A.<break time=\"1s\"/> Should we continue?", "I am sorry but I don't much about A. Should we continue?", [{name: "a", lifespan: 1}, {name: "b", lifespan: 2}])
        );
    });
});

function buildExpectedContextOut(speech, text, contextOut) {
    let context = {
        speech: speech,
        displayText: text,
        source: "samuelli.net",
    };

    if (contextOut) {
        context = _.extend({}, context, {contextOut: contextOut});
    }

    return context;
}