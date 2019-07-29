"use strict";

const uuid = require('../services/uuid');

function UserSession(id, animalNames, field, chosenValue, fieldAndAttributeValuesToIgnore, speech, gameId) {
    this.id = id;
    this.animalNames = animalNames;
    this.field = field;
    this.chosenValue = chosenValue;
    this.fieldAndAttributeValuesToIgnore = fieldAndAttributeValuesToIgnore || [];
    this.creationTime = undefined;
    this.lastUpdatedTime = undefined;
    this.expirationTime = undefined;
    this.gameId = gameId || uuid();
    // Need to use empty space as DynamoDB doesn't allow empty string
    // https://forums.aws.amazon.com/thread.jspa?threadID=90137
    this.speech = speech || ' ';
    this.interactionHistory = [];
}

module.exports = UserSession;