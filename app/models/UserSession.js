"use strict";

function UserSession(id, animalNames, field, chosenValue) {
    this.id = id;
    this.animalNames = animalNames;
    this.field = field;
    this.chosenValue = chosenValue;
}

module.exports = UserSession;