'use strict';

function Question(field, possibleValues, chosenValue, questionType) {
    this.field = field;
    this.possibleValues = possibleValues;
    this.chosenValue = chosenValue;
    this.questionType = questionType || "filter_based_question";
}

Question.FILTER_BASED_QUESTION = "filter_based_question";
Question.READY_TO_GUESS_QUESTION = "ready_to_guess_question";
Question.GIVE_UP_MESSAGE = "give_up_message";

Question.prototype.toText = function () {
    switch (this.questionType) {
        case "filter_based_question":
            switch (this.field) {
                case "types":
                    return `Is your animal a ${this.chosenValue}?`;
                case "behaviours":
                    return `Does your animal ${this.chosenValue}?`;
                case "physical":
                    return `Does your animal have ${this.chosenValue}?`;
                case "diet":
                    return `Does your animal eat ${this.chosenValue}?`;
                case "possible_behaviours":
                    return `Can your animal ${this.chosenValue}?`;
                case "considerations":
                    return `Is your animal considered ${this.chosenValue}?`;
                case "adjectives":
                    return `Is your animal ${this.chosenValue}?`;
                default:
                    return "I don't know what to ask!";
            }
        case "ready_to_guess_question":
            return `It is a ${this.chosenValue}. Am I right?`;
        case Question.GIVE_UP_MESSAGE:
            return "I give up. I don't know which animal you are thinking about.";
    }
    return "I think I am broken. I don't know what to say.";
};

module.exports = Question;