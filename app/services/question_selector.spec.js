'use strict';
const mockRandom = {
    randomItemFromArray: function (arr) {
        return arr[0];
    }
};
const proxyquire = require('proxyquire'),
    QuestionSelector = proxyquire('./question_selector', {'./random': mockRandom}),
    Question = require('../models/question'),
    should = require('chai').should();

describe('Question selector', function () {
    beforeEach(function () {

    });

    ["types", "behaviours", "physical", "diet"].forEach(function (fieldToTest) {
        it(`should select 2 most popular field and attribute values for next question about "${fieldToTest}" when the "${fieldToTest}" is the only field all animals have`, function () {
            let animals = buildTestAnimalsWithOnlyOneField(fieldToTest);
            let nextQuestion = QuestionSelector.nextQuestion(animals);
            should.exist(nextQuestion);
            nextQuestion.field.should.equal(fieldToTest);
            nextQuestion.possibleValues.should.deep.equal(["v1", "v2"]);
            nextQuestion.chosenValue.should.equal("v1");
        });
    });

    ["types", "behaviours", "physical", "diet"].forEach(function (fieldToTest) {
        it(`should return next question about "${fieldToTest}" when the "${fieldToTest}" is not the only field all animals have`, function () {
            let animals = buildTestAnimalsWithAllFields(fieldToTest);
            let nextQuestion = QuestionSelector.nextQuestion(animals);
            should.exist(nextQuestion);
            nextQuestion.field.should.equal(fieldToTest);
            nextQuestion.possibleValues.should.deep.equal(["v1", "v2"]);
            nextQuestion.chosenValue.should.equal("v1");
        });
    });

    // TODO: this test is broken until question_selector can handle scenario where no animal is left in the list
    // e.g. all animals have same attributes
    it('should return null when next question cannot be determined', function () {
        // all animals have idential attributes, system cannot determine the next question to ask
        let animals = buildTestAnimalsWithSameValuesInFields();
        let nextQuestion = QuestionSelector.nextQuestion(animals);
        should.exist(nextQuestion);
        nextQuestion.questionType.should.equal(Question.GIVE_UP_MESSAGE);
    });

    it('should ignore attributes that exists on all animals', function () {
        ["types", "behaviours", "physical", "diet"].forEach(function (fieldToTest) {
            let animals = buildTestAnimalsWithOneCommonAttributeOnAllAnimals(fieldToTest);
            let nextQuestion = QuestionSelector.nextQuestion(animals);
            should.exist(nextQuestion);
            nextQuestion.field.should.equal(fieldToTest);
            nextQuestion.chosenValue.should.not.equal("v1");
        });
    });
});

function buildTestAnimalsWithSameValuesInFields() {
    return [
        {
            name: "A",
            types: ["t1", "t2", "t3"],
            behaviors: ["b1", "b2", "b3"],
            diet: ["d1", "d2", "d3"],
            physical: ["p1", "p2", "p3"]
        },
        {
            name: "B",
            types: ["t1", "t2", "t3"],
            behaviors: ["b1", "b2", "b3"],
            diet: ["d1", "d2", "d3"],
            physical: ["p1", "p2", "p3"]
        }
    ];
}

function buildTestAnimalsWithOnlyOneField(field) {
    return [
        {
            name: "A",
            [field]: ["v1", "v2", "v4", "v5"],
        },
        {
            name: "B",
            [field]: ["v1", "v2", "v6", "v7"],
        },
        {
            name: "C",
            [field]: ["v1", "v3", "v8", "v9"],
        },
        {
            name: "C",
            [field]: ["v10", "v11", "v12", "v13"],
        }
    ];
}

function buildTestAnimalsWithOneCommonAttributeOnAllAnimals(field) {
    return [
        {
            name: "A",
            [field]: ["v1", "v2", "v3", "v4"]
        },
        {
            name: "B",
            [field]: ["v1", "v12", "v13", "v14"]
        },
        {
            name: "C",
            [field]: ["v1", "v22", "v23", "v24"]
        }
    ];
}

function buildTestAnimalsWithAllFields(fieldToTest) {
    const DISTINGUISHING_ATTRIBUTES = [["v1", "v2", "v100"], ["v1", "v2", "v102"], ["v1", "v103", "v104"], ["v105", "v106", "v107"]];
    let animals = [];
    ["A", "B", "C", "D"].forEach(function (animalName, idx) {
        let animal = {};
        ["types", "diet", "behaviours", "physical"].forEach(function (field) {
            if (field === fieldToTest) {
                animal[field] = DISTINGUISHING_ATTRIBUTES[idx];
            } else {
                animal[field] = [field + "v10", field + "v20", field + "v30"];
            }
        });
        animals.push(animal);
    });
    return animals;
}