'use strict';

function Question(field, possibleValues, chosenValue) {
    this.field = field;
    this.possibleValues = possibleValues;
    this.chosenValue = chosenValue;
}

Question.prototype.toText = function () {
    switch (this.field) {
        case "types":
            return `Is it a ${this.chosenValue}?`;
        case "behaviours":
            return `Does it ${this.chosenValue}?`;
        case "physical":
            return `Does it have ${this.chosenValue}?`;
        case "diet":
            return `Does it eat ${this.chosenValue}?`;
        default:
            return "I don't know what to ask!";
    }
};

module.exports = Question;