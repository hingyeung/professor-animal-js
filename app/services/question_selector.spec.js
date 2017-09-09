'use strict';

const QuestionSelector = require('./question_selector'),
    should = require('chai').should();

let templateAnimals;

describe('Question selector', function () {
    beforeEach(function () {
        templateAnimals = [
            {
                name: "A",
                types: ["t1", "t2", "t3"],
                behaviours: ["b1", "b2", "b3"],
                physical: ["p1", "p2", "p3"],
                diet: ["d1", "d2", "d3"]
            },
            {
                name: "B",
                types: ["t3", "t4", "t5"],
                behaviours: ["b3", "b4", "b5"],
                physical: ["p3", "p4", "p5"],
                diet: ["d3", "d4", "d5"]
            },
            {
                name: "C",
                types: ["t5", "t6", "t1"],
                behaviours: ["b5", "b6", "b1"],
                physical: ["p5", "p6", "p1"],
                diet: ["d5", "d6", "d1"]
            }
        ];
    });

    it('should return next question about "types"', function () {
        let animals = [
            {
                name: "A",
                types: ["t1", "t2", "t3"],
            },
            {
                name: "B",
                types: ["t3", "t4", "t5"],
            },
            {
                name: "C",
                types: ["t5", "t6", "t1"],
            }
        ];
        let nextQuestion = QuestionSelector.nextQuestion(animals);
        nextQuestion.should.not.to.be.null;
        nextQuestion.field.should.equal("types");
        nextQuestion.possibleValues.should.deep.equal(["t2", "t4", "t6"]);
    });
});