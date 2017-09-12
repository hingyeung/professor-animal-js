'use strict';

const fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

function AnimalRepo(datafile) {
    this.datafile = !datafile ? path.join(__dirname, '../data/animals.json') : datafile;
    this.animalsLoadedFromFile = JSON.parse(fs.readFileSync(this.datafile));
}

AnimalRepo.prototype.allAnimals = function () {
    return this.animalsLoadedFromFile;
};

AnimalRepo.prototype.convertAnimalListToAnimalNameList = function (animalList) {
    return _.map(animalList, function (animal) {
        return animal.name;
    });
};

AnimalRepo.prototype.convertAnimalNameListToAnimalList = function(animalNameList) {
    let animalList = [];
    this.animalsLoadedFromFile.forEach(function (animal) {
        if (_.includes(animalNameList, animal.name)) {
            animalList.push(animal);
        }
    });
    return animalList;
};

module.exports = AnimalRepo;
