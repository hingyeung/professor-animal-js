'use strict';

const _ = require('lodash');

const AnimalFilter = {
    filter: filter
};

function filter(animals, inclusive, field, chosenValue) {
    return _.filter(animals, function (animal) {
        return inclusive ?
            _.includes(animal[field], chosenValue) :
            !_.includes(animal[field], chosenValue);
    });
}

module.exports = AnimalFilter;