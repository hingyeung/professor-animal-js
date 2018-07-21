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

module.exports = {
    convertAnimalNameListToAnimalList: convertAnimalNameListToAnimalList
};