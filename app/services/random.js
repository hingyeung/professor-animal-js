'use strict';

const _ = require('lodash');

function randomItemFromArray(arr) {
    return arr[_.random(arr.length - 1)];
}

module.exports = {
    randomItemFromArray: randomItemFromArray
};