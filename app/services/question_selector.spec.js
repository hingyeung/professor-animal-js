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

    it('should return next question about "types" when only distinguish attributes are in "types"', function () {
        let animals = buildTestAnimals("types");
        let nextQuestion = QuestionSelector.nextQuestion(animals);
        nextQuestion.should.not.to.be.null;
        nextQuestion.field.should.equal("types");
        nextQuestion.possibleValues.should.deep.equal(["v2", "v4", "v6"]);
    });

    it('should return next question about "behaviours" when only distinguish attributes are in "behaviours"', function () {
        let animals = buildTestAnimals("behaviours");
        let nextQuestion = QuestionSelector.nextQuestion(animals);
        nextQuestion.should.not.to.be.null;
        nextQuestion.field.should.equal("behaviours");
        nextQuestion.possibleValues.should.deep.equal(["v2", "v4", "v6"]);
    });

    it('should return next question about "physical" when only distinguish attributes are in "physical"', function () {
        let animals = buildTestAnimals("physical");
        let nextQuestion = QuestionSelector.nextQuestion(animals);
        nextQuestion.should.not.to.be.null;
        nextQuestion.field.should.equal("physical");
        nextQuestion.possibleValues.should.deep.equal(["v2", "v4", "v6"]);
    });
});

function buildTestAnimals(field) {
    return [
        {
            name: "A",
            [field]: ["v1", "v2", "v3"],
        },
        {
            name: "B",
            [field]: ["v3", "v4", "v5"],
        },
        {
            name: "C",
            [field]: ["v5", "v6", "v1"],
        }
    ];
}