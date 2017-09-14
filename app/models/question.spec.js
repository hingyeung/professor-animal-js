'use strict';

const Question = require('./question'),
    should = require('chai').should();

describe('Question', function () {
    it('should convert question for field "types" to text', function () {
        let question = new Question("types", ["A", "B", "C"], "B");
        question.toText().should.equal("Is it a B?");
    });

    it('should convert question for field "behaviours" to text', function () {
        let question = new Question("behaviours", ["A", "B", "C"], "B");
        question.toText().should.equal("Does it B?");
    });

    it('should convert question for field "physical" to text', function () {
        let question = new Question("physical", ["A", "B", "C"], "B");
        question.toText().should.equal("Does it have B?");
    });

    it('should convert question for field "diet" to text', function () {
        let question = new Question("diet", ["A", "B", "C"], "B");
        question.toText().should.equal("Does it eat B?");
    });
});