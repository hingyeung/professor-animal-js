'use strict';

const Question = require('../models/question'),
    random = require('./random'),
    { getLogger } = require('./logger_utils'),
    _ = require('lodash');

const logger = getLogger();

let QuestionSelector = {
    nextQuestion: nextQuestion
};


function nextQuestion(animals, fieldAndAttributeValuesToIgnore) {
    let attibuteCountMapForAllAnimals = {};

    // build a frequency map for the current attribute (e.g. types)
    animals.forEach(function (animal) {
        _.forEach(["types", "behaviours", "physical", "diet", "possible_behaviours", "considerations", "adjectives"], function (attributeType) {
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

    // Get the two attribute values are featured in almost half of the remaining animals.
    // this should cut the number of remaining animals by as close to half as possible.
    // Needed two to introduce less predictability
    let middlePopularAttrubuteValues = findTwoAttributeValuesWithMediumFrequency(attributeListSortedByFreq, animals.length);

    // the resulting map attributesWithHighestFreq should contain a list of [{field, attr, freq}] sorted by frequency
    // field e.g.: diet
    // attr e.g.: grass
    let attributesWithMiddleFreq = _.filter(attributeListSortedByFreq, function (attribute) {
        // 1. the first element in the list should have the frequency close to half of the animals and all elements with
        //    this frequency will be included in the shortlist.
        // 2. to make things less predictable, include the 2 frequencies closest the half the number of remaining
        //    animals in the shortlist
        //
        // first frequency and first frequency - 1 is not good enough because there could be a gap between
        // the the two frequencies (e.g. 1: 10, 2: 3. Including frequency 10 and 9 doesn't
        // do anything.
        // return attributeListSortedByFreq[0].freq === attribute.freq || attributeListSortedByFreq[0].freq - 1 === attribute.freq;
        return _.indexOf(middlePopularAttrubuteValues, attribute.freq) !== -1;
    }).map(function (o) {
        logger.info('attribute with high[est] frequency: %o', o);
        return {field: o.field, attr: o.attr, freq: o.freq};
    });

    if (attributesWithMiddleFreq.length === 0) {
        return new Question(null, null, null, Question.GIVE_UP_MESSAGE);
    }

    return determineNextQuestionFromAttributeHighestFreqMap(attributesWithMiddleFreq);
}

function getUniqueSortedAttributeValues(attributeList) {
    if (attributeList.length <= 1) {
        return attributeList;
    }

    let freqList = _.map(attributeList, function (item) {
        return item.freq;
    });

    return _.uniq(freqList);
}

// this function assumes attribteList is already sorted in descending order
function findTwoAttributeValuesWithMediumFrequency(attributeList, numberOfRemainingAnimals) {
    let freqList = getUniqueSortedAttributeValues(attributeList);
    let freqListSortedByProximityToMidpoint = _.orderBy(freqList, [function(o) {return Math.abs(numberOfRemainingAnimals / 2 - o);}]);
    return [freqListSortedByProximityToMidpoint[0], freqListSortedByProximityToMidpoint[1]];
}

function determineNextQuestionFromAttributeHighestFreqMap(attributesWithHighestFreqFromAllFields) {
    let attributeWithHighestFreq = random.randomItemFromArray(attributesWithHighestFreqFromAllFields);
    let allAttributesForTheSameField = _.filter(attributesWithHighestFreqFromAllFields, function (o) {
        return o.field === attributeWithHighestFreq.field;
    }).map(function (o) {
        return o.attr;
    });

    return new Question(attributeWithHighestFreq.field, allAttributesForTheSameField, random.randomItemFromArray(allAttributesForTheSameField));
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