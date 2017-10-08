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
        _.forEach(["types", "behaviours", "physical", "diet", "possible_behaviours", "considerations"], function (attributeType) {
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

    // get the 1st and 2nd highest frequency, needed for introducing less predictability
    let firstAndSecondMostPopularAttrubuteValues = findTwoAttributeValusWithHighestFrequency(attributeListSortedByFreq);

    // the resulting map attributesWithHighestFreq should contain a list of [{field, attr, freq}] sorted by frequency
    // field e.g.: diet
    // attr e.g.: grass
    let attributesWithHighestFreq = _.filter(attributeListSortedByFreq, function (attribute) {
        // 1. the first element in the list should have the highest frequency and all elements with
        //    this frequency will be included in the shortlist.
        // 2. to make things less predictable, include top 2 frequencies (2 most popular) in the shortlist
        //
        // Top frequency and top frequency - 1 is not good enough because there could be a gap between
        // the top frequency and the 2nd highest frequence (e.g. 1: 10, 2: 3. Including frequency 10 and 9 doesn't
        // do anything.
        // return attributeListSortedByFreq[0].freq === attribute.freq || attributeListSortedByFreq[0].freq - 1 === attribute.freq;
        return _.indexOf(firstAndSecondMostPopularAttrubuteValues, attribute.freq) !== -1;
    }).map(function (o) {
        return {field: o.field, attr: o.attr, freq: o.freq};
    });

    if (attributesWithHighestFreq.length === 0) {
        return new Question(null, null, null, Question.GIVE_UP_MESSAGE);
    }

    return determineNextQuestionFromAttributeHighestFreqMap(attributesWithHighestFreq);
}

// this function assumes attribteList is already sorted in descending order
function findTwoAttributeValusWithHighestFrequency(attributeList) {
    if (attributeList.length === 0) {
        return attributeList;
    }

    let freqList = _.map(attributeList, function (item) {
        return item.freq;
    });

    freqList = _.uniq(freqList);
    return [freqList[0], freqList[1]];
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