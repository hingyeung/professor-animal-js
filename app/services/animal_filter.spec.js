'use strict';

const AnimalFilter = require('./animal_filter'),
    path = require('path'),
    should = require('chai').should(),
    UserSession = require('../models/UserSession'),
    fs = require('fs');

let animalsToPlayWith;

describe('animal_filter', function () {
    beforeEach(function () {
        animalsToPlayWith = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/test-animals.json')));
    });

    [
        {field: "types", value: "herbivore", expected: ["Elephant"]},
        {field: "diet", value: "fish", expected: ["Shark", "Penguin"]},
        {field: "physical", value: "long tongue", expected: ["Chameleon"]},
        {field: "behaviours", value: "hunt in a pack", expected: ["Lion"]}
    ].forEach(function (testData) {
        it(`should include animals with given value in field ${testData.field}`, function () {
            let filteredAnimal = AnimalFilter.filter(animalsToPlayWith, true, testData.field, testData.value);
            filteredAnimal.length.should.equal(testData.expected.length);
            filteredAnimal.forEach(function (animal, idx) {
                animal.name.should.equal(testData.expected[idx]);
            });
        });
    });

    [
        {field: "types", value: "herbivore", expected: ["Lion", "Chameleon", "Shark", "Penguin", "Eagle"]},
        {field: "diet", value: "fish", expected: ["Lion", "Elephant", "Chameleon", "Eagle"]},
        {field: "physical", value: "long tongue", expected: ["Lion", "Elephant", "Shark", "Penguin", "Eagle"]},
        {field: "behaviours", value: "hunt in a pack", expected: ["Elephant", "Chameleon", "Shark", "Penguin", "Eagle"]}
    ].forEach(function (testData) {
        it(`should exclude animals with given value in field ${testData.field}`, function () {
            let filteredAnimal = AnimalFilter.filter(animalsToPlayWith, false, testData.field, testData.value);
            filteredAnimal.length.should.equal(testData.expected.length);
            filteredAnimal.forEach(function (animal, idx) {
                animal.name.should.equal(testData.expected[idx]);
            });
        });
    });

});
