'use strict';

const AnimalRepo = require('./animal_repo'),
    should = require('chai').should();

describe('AnimalRepo', function () {
    it('should read animals from file', function () {
        let allAnimals = (new AnimalRepo('app/data/test-animals.json')).allAnimals();
        allAnimals.length.should.equal(6);
        ["Lion", "Elephant", "Chameleon", "Shark", "Penguin", "Eagle"].forEach(function (name, idx) {
            allAnimals[idx].name.should.equal(name, `Animal ${idx} is not ${name}`);
        });
    });

    it('should convert animal list to animal name list', function () {
        let animalRepo = new AnimalRepo('app/data/test-animals.json');
        let allAnimals = animalRepo.allAnimals();
        animalRepo.convertAnimalListToAnimalNameList(allAnimals).should.deep.equal(
            ["Lion", "Elephant", "Chameleon", "Shark", "Penguin", "Eagle"]);
    });

    it('should convert animal name list to animal list', function () {
        let animalRepo = new AnimalRepo('app/data/test-animals.json');
        animalRepo.convertAnimalNameListToAnimalList(['Lion', 'Eagle', 'Shark']).should.deep.equal(
            [{
                "name": "Lion",
                "types": [
                    "vertebrate",
                    "mammal",
                    "big cat",
                    "large",
                    "carnivore",
                    "predator"
                ],
                "behaviours": [
                    "hunt in a pack"
                ],
                "physical": [
                    "mane"
                ],
                "diet": [
                    "zebra",
                    "buffalo",
                    "wildebeest",
                    "giraffes"
                ]
            }, {
                "name": "Shark",
                "types": [
                    "vertebrate",
                    "fish",
                    "carnivore",
                    "predator",
                    "large"
                ],
                "behaviours": [
                    "smell blood in water"
                ],
                "physical": [
                    "sharp teeth"
                ],
                "diet": [
                    "fish",
                    "seals"
                ]
            }, {
                "name": "Eagle",
                "types": [
                    "vertebrate",
                    "bird",
                    "bird of prey",
                    "large"
                ],
                "behaviours": [
                    "carnivore",
                    "predator",
                    "flying"
                ],
                "physical": [
                    "wings",
                    "talon"
                ],
                "diet": [
                    "mouse",
                    "rat",
                    "rabbit"
                ]
            }]
        );

    });
});