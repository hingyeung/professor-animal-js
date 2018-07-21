const fs = require('fs'),
    should = require('chai').should(),
    AnimalListUtils = require('./animal_list_utils');

describe('AnimalListUtils', () => {
    it('should convert animal name list to animal list', function () {
        AnimalListUtils.convertAnimalNameListToAnimalList(
            ['Lion', 'Eagle', 'Shark'],
            JSON.parse(fs.readFileSync('app/data/test-animals.json'))).should.deep.equal(
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