'use strict';

// behaviors: "Does it fly?"
// physical:  "Does it have wings?"
// type:      "Is it a mammal?"
// diet:      "Does it eat grass?"
function Animal(name, behaviours, physical, types, diet) {
    return {
        name: name,
        behaviours: behaviours,
        physical: physical,
        types: types,
        diet: diet
    }
}

module.exports = Animal;