'use strict';

function Question(field, possibleValues, chosenValue, questionType) {
    this.field = field;
    this.possibleValues = possibleValues;
    this.chosenValue = chosenValue;
    this.questionType = questionType || "filter_based_question";
}

Question.prototype.toText = function () {
    switch (this.questionType) {
        case "filter_based_question":
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
            break;
        case "ready_to_guess_question":
            return `It is a ${this.chosenValue}. Am I right?`;
    }
};

module.exports = Question;