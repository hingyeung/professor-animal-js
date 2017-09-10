'use strict';

function Question(field, possibleValues, chosenValue) {
    return {
        field: field,
        possibleValues: possibleValues,
        chosenValue: chosenValue
    };
}

module.exports = Question;