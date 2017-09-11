'use strict';

const AnimalRepo = require('./animal_repo'),
    should = require('chai').should();

describe('AnimalRepo', function () {
    it('should read animals from file', function () {
        let allAnimals = (new AnimalRepo('app/data/test-animals.json')).allAnimals();
        allAnimals.length.should.equal(6);
        ["Lion", "Elephant", "Chameleon", "Shark", "Penguin", "Eagle"].forEach(function(name, idx) {
            allAnimals[idx].name.should.equal(name, `Animal ${idx} is not ${name}`);
        });
    });

    it('should convert animal list to animal name list', function() {
        let animalRepo = new AnimalRepo('app/data/test-animals.json');
        let allAnimals = animalRepo.allAnimals();
        animalRepo.convertAnimalListToAnimalNameList(allAnimals).should.deep.equal(
            ["Lion", "Elephant", "Chameleon", "Shark", "Penguin", "Eagle"]);
    });
});