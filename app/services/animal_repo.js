'use strict';

const fs = require('fs'),
    _ = require('lodash');

function AnimalRepo(datafile) {
    this.datafile = !datafile ? 'data/animals.json' : datafile;
}

AnimalRepo.prototype.allAnimals = function () {
    return JSON.parse(fs.readFileSync(this.datafile));
};

AnimalRepo.prototype.convertAnimalListToAnimalNameList = function (animalList) {
    return _.map(animalList, function (animal) {
        return animal.name;
    });
};

module.exports = AnimalRepo;
