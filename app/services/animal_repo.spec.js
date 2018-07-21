'use strict';

const proxyquire = require('proxyquire'),
    fs = require('fs'),
    should = require('chai').should();

let mockAws, AnimalRepo;

describe('AnimalRepo', function () {
    before(() => {
        mockAws = {
            S3: function () {
                return {
                    getObject: function (params, cb) {
                        cb(null, {
                            Body: Buffer.from(fs.readFileSync('app/data/test-animals.json'))
                        });
                    }
                };
            }
        };
        AnimalRepo = proxyquire('./animal_repo', {'aws-sdk': mockAws});
    });

    it('should read animals from file', function () {
        let animalRepo = new AnimalRepo(), allAnimals;
        animalRepo.loadAnimals()
            .then(() => {
                allAnimals = animalRepo.allAnimals();
                allAnimals.length.should.equal(6);
                ["Lion", "Elephant", "Chameleon", "Shark", "Penguin", "Eagle"].forEach(function (name, idx) {
                    allAnimals[idx].name.should.equal(name, `Animal ${idx} is not ${name}`);
                });
            });
    });

    it('should convert animal list to animal name list', function () {
        let animalRepo = new AnimalRepo();
        animalRepo.loadAnimals()
            .then(() => {
                let allAnimals = animalRepo.allAnimals();
                animalRepo.convertAnimalListToAnimalNameList(allAnimals).should.deep.equal(
                    ["Lion", "Elephant", "Chameleon", "Shark", "Penguin", "Eagle"]);
            });
    });

    it('should convert animal name list to animal list', function () {
        let animalRepo = new AnimalRepo();
        animalRepo.loadAnimals()
            .then(() => {
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
});