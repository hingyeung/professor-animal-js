'use strict';

const proxyquire = require('proxyquire'),
    fs = require('fs'),
    should = require('chai').should();

let mockAws, AnimalRepo;

describe('AnimalRepo', function () {
    beforeEach(() => {
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
});