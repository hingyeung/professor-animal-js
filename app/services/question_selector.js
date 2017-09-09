'use strict';

const Question = require('../models/question'),
    mapKeys = require('lodash.mapkeys'),
    filter = require('lodash.filter'),
    map = require('lodash.map'),
    sortBy = require('lodash.sortby');

let QuestionSelector = {
    nextQuestion: nextQuestion
};


function nextQuestion(animals) {
    let types = animals.types;
    let attibuteCountMapForAllAnimals = {};
    let lowestFreq = 99999;

    // build a frequency map for the current attribute (e.g. types)
    animals.forEach(function (animal) {
        buildAttributeCountMap(attibuteCountMapForAllAnimals, animal.types);
    });

    // sort the attribute values by frequency
    let attributeListSortedByFreq = sortAttributeValueByFreq(attibuteCountMapForAllAnimals);
    let attributesWithLowestFreq = map(filter(attributeListSortedByFreq, function (attribute) {
        return attributeListSortedByFreq[0].freq === attribute.freq;
    }), function(o) {
        return o.attr;
    });

    return new Question("types", attributesWithLowestFreq);
}

function buildAttributeCountMap(attributeCountMap, attributeValueArray) {
    attributeValueArray.forEach(function (value) {
        if (attributeCountMap[value]) {
            attributeCountMap[value]++;
        } else {
            attributeCountMap[value] = 1;
        }
    });
}

function sortAttributeValueByFreq(buildAttributeCountMap) {
    let attributeWithFreqList = [];
    // map to list
    mapKeys(buildAttributeCountMap, function (value, key) {
        attributeWithFreqList.push({attr: key, freq: value});
    });

    // sort the list
    return sortBy(attributeWithFreqList, ['freq']);
}

module.exports = QuestionSelector;