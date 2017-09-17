'use strict';
const mockRandom = {
    randomItemFromArray: function (arr) {
        return arr[0];
    }
};
const proxyquire = require('proxyquire'),
    QuestionSelector = proxyquire('./question_selector', {'./random': mockRandom}),
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

    ["types", "behaviours", "physical", "diet"].forEach(function (fieldToTest) {
        it(`should select most popular field and attribute value for next question about "${fieldToTest}" when the "${fieldToTest}" is the only field all animals have`, function () {
            let animals = buildTestAnimalsWithOnlyOneField(fieldToTest);
            let nextQuestion = QuestionSelector.nextQuestion(animals);
            should.exist(nextQuestion);
            nextQuestion.field.should.equal(fieldToTest);
            nextQuestion.possibleValues.should.deep.equal(["v1"]);
            nextQuestion.chosenValue.should.equal("v1");
        });
    });

    ["types", "behaviours", "physical", "diet"].forEach(function (fieldToTest) {
        it(`should return next question about "${fieldToTest}" when the "${fieldToTest}" is not the only field all animals have`, function () {
            let animals = buildTestAnimalsWithAllFields(fieldToTest);
            let nextQuestion = QuestionSelector.nextQuestion(animals);
            should.exist(nextQuestion);
            nextQuestion.field.should.equal(fieldToTest);
            nextQuestion.possibleValues.should.deep.equal([fieldToTest + 'v10', fieldToTest + 'v20', fieldToTest + 'v30']);
            nextQuestion.chosenValue.should.equal(fieldToTest + "v10");
        });
    });

    it(`should return next question about "types" when all animals have the same attributes`, function () {
        let animals = buildTestAnimalsWithSameValuesInFields();
        let nextQuestion = QuestionSelector.nextQuestion(animals);
        should.exist(nextQuestion);
        nextQuestion.field.should.equal("types");
        nextQuestion.possibleValues.should.deep.equal(["t1", "t2", "t3"]);
        nextQuestion.chosenValue.should.equal("t1");
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
            [field]: ["v1", "v2", "v3", "v8"],
        },
        {
            name: "B",
            [field]: ["v1", "v3", "v4", "v5"],
        },
        {
            name: "C",
            [field]: ["v5", "v6", "v7", "v1"],
        }
    ];
}

function buildTestAnimalsWithAllFields(fieldToTest) {
    const DISTINGUISHING_ATTRIBUTES = [["v1", "v2", "v3"], ["v4", "v5", "v6"], ["v7", "v8", "v9"]];
    let animals = [];
    ["A", "B", "C"].forEach(function (animalName, idx) {
        let animal = {};
        ["types", "diet", "behaviours", "physical"].forEach(function (field) {
            if (field !== fieldToTest) {
                animal[field] = DISTINGUISHING_ATTRIBUTES[idx];
            } else {
                animal[field] = [field + "v10", field + "v20", field + "v30"];
            }
        });
        animals.push(animal);
    });
    return animals;
}