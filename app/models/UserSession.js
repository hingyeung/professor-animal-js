"use strict";

function UserSession(id, animalNames, field, chosenValue, fieldAndAttributeValuesToIgnore, speech) {
    this.id = id;
    this.animalNames = animalNames;
    this.field = field;
    this.chosenValue = chosenValue;
    this.fieldAndAttributeValuesToIgnore = fieldAndAttributeValuesToIgnore || [];
    // Need to use empty space as DynamoDB doesn't allow empty string
    // https://forums.aws.amazon.com/thread.jspa?threadID=90137
    this.speech = speech || ' ';
}

module.exports = UserSession;