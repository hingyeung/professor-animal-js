"use strict";

function UserSession(id, animalNames, field, chosenValue, fieldAndAttributeValuesToIgnore) {
    this.id = id;
    this.animalNames = animalNames;
    this.field = field;
    this.chosenValue = chosenValue;
    this.fieldAndAttributeValuesToIgnore = fieldAndAttributeValuesToIgnore || [];
}

module.exports = UserSession;