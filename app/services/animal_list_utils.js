'use strict';

const _ = require('lodash');

let convertAnimalNameListToAnimalList = function (animalNameList, fullAnimalList) {
    let animalList = [];
    fullAnimalList.forEach(function (animal) {
        if (_.includes(animalNameList, animal.name)) {
            animalList.push(animal);
        }
    });
    return animalList;
};

let convertAnimalListToAnimalNameList = function (animalList) {
    return _.map(animalList, function (animal) {
        return animal.name;
    });
};

module.exports = {
    convertAnimalNameListToAnimalList: convertAnimalNameListToAnimalList,
    convertAnimalListToAnimalNameList: convertAnimalListToAnimalNameList
};