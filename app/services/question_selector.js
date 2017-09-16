'use strict';

const Question = require('../models/question'),
    random = require('./random'),
    _ = require('lodash');

let QuestionSelector = {
    nextQuestion: nextQuestion
};


function nextQuestion(animals) {
    let attibuteCountMapForAllAnimals = {};

    // build a frequency map for the current attribute (e.g. types)
    animals.forEach(function (animal) {
        _.forEach(["types", "behaviours", "physical", "diet"], function (attributeType) {
            if (!animal[attributeType]) {
                return;
            }
            buildAttributeCountMap(attibuteCountMapForAllAnimals, attributeType, animal[attributeType]);
        });
    });

    // sort the attribute values by frequency
    let attributeListSortedByFreq = sortAttributeValueByFreq(attibuteCountMapForAllAnimals);

    // the resulting map attributesWithLowestFreq should contain a list of [{field, attr}] sorted by frequency
    // field e.g.: diet
    // attr e.g.: grass
    let attributesWithLowestFreq = _.filter(attributeListSortedByFreq, function (attribute) {
        return attributeListSortedByFreq[0].freq === attribute.freq;
    }).map(function (o) {
        return {field: o.field, attr: o.attr, freq: o.freq};
    });

    return determineNextQuestionFromAttributeLowestFreqMap(attributesWithLowestFreq);
}

function determineNextQuestionFromAttributeLowestFreqMap(attributesWithLowestFreqFromAllFields) {
    // TODO: what if attributesWithLowestFreq is empty?
    let attributeWithLowestFreq = attributesWithLowestFreqFromAllFields[0];
    let allAttributesForTheSameField = _.filter(attributesWithLowestFreqFromAllFields, function (o) {
        return o.field === attributeWithLowestFreq.field;
    }).map(function (o) {
        return o.attr;
    });

    return new Question(attributeWithLowestFreq.field, allAttributesForTheSameField, random.randomItemFromArray(allAttributesForTheSameField));
}

// attributeCountMap: map to be updated with attribute frequency for each attributeType
// attributeType: type of attribute in which values in attributeValueArray belong to
// attributeValueArray: a list of attribute values of type attributeType
function buildAttributeCountMap(attributeCountMap, attributeType, attributeValueArray) {
    attributeValueArray.forEach(function (value) {
        let currentFreq = _.get(attributeCountMap, [attributeType, value], 0);
        _.set(attributeCountMap, [attributeType, value], currentFreq + 1);
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
    return _.sortBy(attributeWithFreqList, ['freq']);
}

module.exports = QuestionSelector;