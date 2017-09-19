'use strict';

const Question = require('../models/question'),
    random = require('./random'),
    _ = require('lodash');

let QuestionSelector = {
    nextQuestion: nextQuestion
};


function nextQuestion(animals, fieldAndAttributeValuesToIgnore) {
    let attibuteCountMapForAllAnimals = {};

    // build a frequency map for the current attribute (e.g. types)
    animals.forEach(function (animal) {
        _.forEach(["types", "behaviours", "physical", "diet"], function (attributeType) {
            if (!animal[attributeType]) {
                return;
            }
            updateAttributeCountMap(attibuteCountMapForAllAnimals, attributeType, animal[attributeType], fieldAndAttributeValuesToIgnore);
        });
    });

    // sort the attribute values by frequency
    // resulting list looks like [{field, attr, freq}, {field, attr, freq}]
    let attributeListSortedByFreq = sortAttributeValueByFreq(attibuteCountMapForAllAnimals);

    // remove item that has frequency same as the number of animals left because these attributes exist
    // on all animal and should not be used to form the next question
    attributeListSortedByFreq = _.filter(attributeListSortedByFreq, function (item) {
        return item.freq < animals.length;
    });

    // the resulting map attributesWithLowestFreq should contain a list of [{field, attr, freq}] sorted by frequency
    // field e.g.: diet
    // attr e.g.: grass
    let attributesWithLowestFreq = _.filter(attributeListSortedByFreq, function (attribute) {
        return attributeListSortedByFreq[0].freq === attribute.freq;
    }).map(function (o) {
        return {field: o.field, attr: o.attr, freq: o.freq};
    });

    if (attributesWithLowestFreq.length === 0) {
        return new Question(null, null, null, Question.GIVE_UP_MESSAGE);
    }

    return determineNextQuestionFromAttributeLowestFreqMap(attributesWithLowestFreq);
}

function determineNextQuestionFromAttributeLowestFreqMap(attributesWithLowestFreqFromAllFields) {
    let attributeWithLowestFreq = random.randomItemFromArray(attributesWithLowestFreqFromAllFields);
    let allAttributesForTheSameField = _.filter(attributesWithLowestFreqFromAllFields, function (o) {
        return o.field === attributeWithLowestFreq.field;
    }).map(function (o) {
        return o.attr;
    });

    return new Question(attributeWithLowestFreq.field, allAttributesForTheSameField, random.randomItemFromArray(allAttributesForTheSameField));
}

// attributeCountMap: map to be updated with attribute frequency for each attributeType. e.g. { diet: {banana: 1, nut: 2} }
// attributeType: type of attribute in which values in attributeValueArray belong to
// attributeValueArray: a list of attribute values of type attributeType
// fieldAndAttributeValuesToIgnore: ignore these field-attributeValue from the result map so they won't be part of the next question
function updateAttributeCountMap(attributeCountMap, attributeType, attributeValueArray, fieldAndAttributeValuesToIgnore) {
    attributeValueArray.forEach(function (value) {
        if (!_.some(fieldAndAttributeValuesToIgnore, {field: attributeType, attributeValue: value})) {
            let currentFreq = _.get(attributeCountMap, [attributeType, value], 0);
            _.set(attributeCountMap, [attributeType, value], currentFreq + 1);
        }
    });
}

// attibuteFreqMapForAllAnimals is a map that contains frequency of attributes for each field
// from all the remaiining animals.
//
// attibuteFreqMapForAllAnimals = {
//     types: {
//         mammal: 3,
//         bird: 2
//     },
//     behaviors: {
//         fly: 1,
//         swim: 2
//     },
//     diet: {
//         grass: 1,
//         insects: 4
//     }
// }
function sortAttributeValueByFreq(attibuteFreqMapForAllAnimals) {
    let attributeWithFreqList = [];
    // map to list
    _.mapKeys(attibuteFreqMapForAllAnimals, function (attributeAndFreqMap, field) {
        // attributeWithFreqList.push({attr: key, freq: value});
        _.mapKeys(attributeAndFreqMap, function (freq, attribute) {
            attributeWithFreqList.push({attr: attribute, freq: freq, field: field});
        });
    });

    // sort the list
    return _.orderBy(attributeWithFreqList, ['freq'], ['desc']);
}

module.exports = QuestionSelector;