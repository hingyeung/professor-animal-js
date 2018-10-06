'use strict';

const ResponseToApiAi = require('./response_to_api_ai'),
    should = require('chai').should(),
    Context = require('./context'),
    UserSession = require('../models/UserSession'),
    _ = require('lodash'),
    Question = require('./question');

const FIELD_PREFIX = "question-field--",
    CHOSEN_VALUE_PREFIX = "question-chosenvalue--";

describe('ResponseFromApiAi', function () {
    it('should add "ingame", type and chosen value of the next question to contextOut', function () {
        const question = new Question("types", ["A", "B"], "A", Question.FILTER_BASED_QUESTION);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), question.field, question.chosenValue, [
                new Context('ingame', 1)
            ])
        );
    });

    it('should set the lifespan of question type and chosen value of the previous question in contextOut to zero', () => {
        const additionalContextOut = [new Context(`${FIELD_PREFIX}physical`, 1), new Context(`${CHOSEN_VALUE_PREFIX}wings`, 1)];
        const question = new Question("types", ["A", "B"], "A", Question.FILTER_BASED_QUESTION);
        let expectedContextOut = buildExpectedContextOut(question.toText(), question.toText(), question.field, question.chosenValue, [
            new Context('ingame', 1)
        ]);
        // lifespan of previous question type and chosen value should be zeroed out
        expectedContextOut.contextOut.push(new Context(`${FIELD_PREFIX}physical`, 0));
        expectedContextOut.contextOut.push(new Context(`${CHOSEN_VALUE_PREFIX}wings`, 0));
        expectedContextOut.contextOut.sort((a,b) => a.name > b.name);

        ResponseToApiAi.fromQuestion(question, additionalContextOut).should.deep.equal(expectedContextOut);
    });

    it('should remove defaultwelcome* context in contextOut when in-game by setting lifespan to zero', function () {
        const question = new Question("types", ["A", "B"], "A", Question.FILTER_BASED_QUESTION);
        const additionalContextOut = [
            new Context("NotDefaultWelcomeIntent", 1),
            new Context("DefaultWelcomeIntentA", 1),
            new Context("DefaultWelcomeIntentB", 1),
            new Context("defaultwelcomeintentc", 1)];
        ResponseToApiAi.fromQuestion(question, additionalContextOut).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), question.field, question.chosenValue, [
                new Context('ingame', 1),
                new Context("NotDefaultWelcomeIntent", 1),
                new Context("DefaultWelcomeIntentA", 0),
                new Context("DefaultWelcomeIntentB", 0),
                new Context("defaultwelcomeintentc", 0)])
        );
    });

    it('should convert ready-to-guess question to response object with contextOut set to "readytoguess" to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A", Question.READY_TO_GUESS_QUESTION);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), null, null, [new Context('readytoguess', 1)])
        );
    });

    it('should convert give-up question to response object without contextOut set to "giveup" to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A", Question.GIVE_UP_MESSAGE);
        ResponseToApiAi.fromQuestion(question).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), null, null, [new Context('giveup', 1)])
        );
    });

    it('should convert question to response object with additional contextOut to api.ai', function () {
        let question = new Question("types", ["A", "B"], "A");
        ResponseToApiAi.fromQuestion(question, [new Context("name", 1)]).should.deep.equal(
            buildExpectedContextOut(question.toText(), question.toText(), question.field, question.chosenValue, [new Context('ingame', 1), new Context('name', 1)])
        );
    });

    it('should use speech saved in session when in-context is not set', function () {
        let userSession = new UserSession("123");
        userSession.speech = 'previous speech';
        ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, []).should.deep.equal({
            speech: "previous speech",
            displayText: "previous speech",
            source: "samuelli.net"
        });
    });

    it('should use speech saved in session when in-context is set', function () {
        let userSession = new UserSession("123");
        userSession.speech = 'previous speech';
        const contexts = [new Context('a', 1), new Context('b', 1)];
        ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, contexts).should.deep.equal({
            speech: "previous speech",
            displayText: "previous speech",
            source: "samuelli.net",
            contextOut: contexts
        });
    });

    it('should convert glossary definition without in-context', function () {
        ResponseToApiAi.answerGlossaryEnquiry("A", "definition for A.", []).should.deep.equal(
            buildExpectedContextOut("<speak>definition for A.<break time=\"1s\"/> Should we continue?</speak>", "definition for A. Should we continue?", null, null, null)
        );
    });

    it('should convert glossary definition with in-context', function () {
        const contexts = [new Context('a', 1), new Context('b', 1)];
        ResponseToApiAi.answerGlossaryEnquiry("A", "definition for A.", contexts).should.deep.equal(
            buildExpectedContextOut("<speak>definition for A.<break time=\"1s\"/> Should we continue?</speak>", "definition for A. Should we continue?", null, null, contexts)
        );
    });

    it('should convert unknown glossary definition without in-context', function () {
        ResponseToApiAi.answerUnknownGlossaryEnquiry("A", []).should.deep.equal(
            buildExpectedContextOut("<speak>I am sorry but I don't much about A.<break time=\"1s\"/> Should we continue?</speak>", "I am sorry but I don't much about A. Should we continue?", null, null, null)
        );
    });

    it('should convert unknown glossary definition with in-context', function () {
        const contexts = [new Context('a', 1), new Context('b', 2)];
        ResponseToApiAi.answerUnknownGlossaryEnquiry("A", contexts).should.deep.equal(
            buildExpectedContextOut("<speak>I am sorry but I don't much about A.<break time=\"1s\"/> Should we continue?</speak>", "I am sorry but I don't much about A. Should we continue?", null, null, contexts)
        );
    });

    it('should convert properly when term for glossary look up is null', function () {
        ResponseToApiAi.answerUnknownGlossaryEnquiry(null, []).should.deep.equal(
            buildExpectedContextOut("<speak>I am sorry but I don't much about that.<break time=\"1s\"/> Should we continue?</speak>", "I am sorry but I don't much about that. Should we continue?", null, null, null)
        );
    });
});

function buildExpectedContextOut(speech, text, questionField, questionChosenValue, contextOut) {
    let context = {
        speech: speech,
        displayText: text,
        source: "samuelli.net",
    };

    let contextOutForResponse = contextOut || [];
    if (questionField) contextOutForResponse.push(new Context(FIELD_PREFIX + questionField, 1));
    if (questionChosenValue) contextOutForResponse.push(new Context(CHOSEN_VALUE_PREFIX + questionChosenValue, 1));

    return _.extend(
        {},
        context,
        contextOutForResponse.length > 0 ?
            {
                contextOut: contextOutForResponse.sort((a, b) => a.name > b.name)
            } : {});
}