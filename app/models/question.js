'use strict';

function Question(field, possibleValues) {
    return {
        field: field,
        possibleValues: possibleValues
    };
}

module.exports = Question;