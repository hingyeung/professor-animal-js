'use strict';

function Question(field, possibleValues, chosenValue) {
    this.field = field;
    this.possibleValues = possibleValues;
    this.chosenValue = chosenValue;
}

Question.prototype.toText = function () {
    if (this.field === 'types') {
        return `Is it a ${this.chosenValue}?`;
    } else if (this.field === "behaviours") {
        return `Does it ${this.chosenValue}?`;
    } else if (this.field === "physical") {
        return `Does it have ${this.chosenValue}?`;
    } else if (this.field === "diet") {
        return `Does it eat ${this.chosenValue}?`;
    }
};

module.exports = Question;