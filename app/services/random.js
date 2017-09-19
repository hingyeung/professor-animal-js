'use strict';

const _ = require('lodash');

function randomItemFromArray(arr) {
    if (arr.length > 0) {
        return arr[_.random(arr.length - 1)];
    }
    return null;
}

module.exports = {
    randomItemFromArray: randomItemFromArray
};