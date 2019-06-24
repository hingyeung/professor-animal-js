'use strict';

const Question = require('./question'),
    should = require('chai').should();

describe('Question', function () {
    it('should convert question for field "types" to text', function () {
        let question = new Question("types", ["A", "B", "C"], "B");
        question.toText().should.equal("Is your animal a B?");
    });

    it('should convert question for field "behaviours" to text', function () {
        let question = new Question("behaviours", ["A", "B", "C"], "B");
        question.toText().should.equal("Does your animal B?");
    });

    it('should convert question for field "physical" to text', function () {
        let question = new Question("physical", ["A", "B", "C"], "B");
        question.toText().should.equal("Does your animal have B?");
    });

    it('should convert question for field "diet" to text', function () {
        let question = new Question("diet", ["A", "B", "C"], "B");
        question.toText().should.equal("Does your animal eat B?");
    });

    it('should convert question for field "adjectives" to text', function () {
        let question = new Question("adjectives", ["A", "B", "C"], "B");
        question.toText().should.equal("Is your animal B?");
    });

    it('should convert question for field "considerations" to text', function () {
        let question = new Question("considerations", ["A", "B", "C"], "B");
        question.toText().should.equal("Is your animal considered B?");
    });

    it('should convert question for field "possible_behaviours" to text', function () {
        let question = new Question("possible_behaviours", ["A", "B", "C"], "B");
        question.toText().should.equal("Can your animal B?");
    });

    it('should convert ready-to-guess question', function () {
        let question = new Question(null, null, "correct animal", Question.READY_TO_GUESS_QUESTION);
        question.toText().should.equal("It is a correct animal. Am I right?");
    });

    it('should convert give-up message', function () {
        let question = new Question(null, null, null, Question.GIVE_UP_MESSAGE);
        question.toText().should.equal("I give up. I don't know which animal you are thinking about.");
    });

    it('should use Question.FILTER_BASED_QUESTION as default questionType', function () {
        let question = new Question(null, null, null);
        question.questionType.should.equal(Question.FILTER_BASED_QUESTION);
    });

    it('should return catch-all message', function () {
        let question = new Question(null, null, null, "blah");
        question.toText().should.equal("I think I am broken. I don't know what to say.");
    });
});