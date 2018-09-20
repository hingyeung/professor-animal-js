const DbService = require("../services/DbService"),
    ResponseToApiAi = require("../models/response_to_api_ai"),
    errorHandler = require("./error_handler"),
    Q = require("q"),
    QuestionSelector = require("../services/question_selector"),
    Question = require("../models/question"),
    AnimalFilter = require("../services/animal_filter"),
    AnimalListUtils = require("../services/animal_list_utils");

const answerQuestionHandler = async (agent, fullAnimalList) => {
    try {
        const userSession = await loadSession(agent.session);
        const answer = agent.parameters.answer;
        console.log("answer: ", answer);
        const contextForNextRound = getNextQuestion2(userSession, answer, fullAnimalList);

        await updateSession(contextForNextRound);
        const response = ResponseToApiAi.fromQuestion(contextForNextRound.nextQuestion);
        // response.speech, response.contextOut
        response.contextOut.forEach(context => agent.setContext(context));
        agent.add(response.speech);
    } catch(err) {
        errorHandler(agent, err);
    }
};

const loadSession = (sessionId) => {
    return (new DbService()).getSession(sessionId);
};

const updateSession = (contextForNextRound) => {
    let dbService = new DbService(),
        deferred = Q.defer(),
        nextQuestion = contextForNextRound.nextQuestion,
        userSession = contextForNextRound.userSession;

    if (nextQuestion.questionType === "filter_based_question") {
        userSession.field = nextQuestion.field;
        userSession.chosenValue = nextQuestion.chosenValue;
        userSession.animalNames = AnimalListUtils.convertAnimalListToAnimalNameList(contextForNextRound.animalsForNextRound);
        userSession.fieldAndAttributeValuesToIgnore = contextForNextRound.fieldAndAttributeValuesToIgnore;
    }
    userSession.speech = nextQuestion.toText();

    dbService.saveSession(userSession)
        .then(function () {
            deferred.resolve(nextQuestion);
        })
        .catch(function (err) {
            deferred.reject(err);
        });
    return deferred.promise;
};

const getNextQuestion2 = function(userSession, answer, fullAnimalList) {
    // const that = this;
    let fieldAndAttributeValuesToIgnore, nextQuestion;
    let animalsToPlayWith = AnimalListUtils.convertAnimalNameListToAnimalList(userSession.animalNames, fullAnimalList);
    // filter animalsToPlayWith before determining the next question
    if (answer === "yes" || answer === "no") {
        animalsToPlayWith = AnimalFilter.filter(animalsToPlayWith, answer === "yes", userSession.field, userSession.chosenValue);
    }
    let animalNameList = AnimalListUtils.convertAnimalListToAnimalNameList(animalsToPlayWith);
    console.log("animals remaining: ", animalNameList, animalNameList.length);

    if (animalsToPlayWith.length === 1) {
        fieldAndAttributeValuesToIgnore = [];
        nextQuestion = new Question(null, null, animalsToPlayWith[0].name, "ready_to_guess_question");
        userSession.speech = nextQuestion.toText();
    } else {
        // if the answer is "yes", the attribute needs to be ignored during the generation of
        // the next question to avoid infinity loop (always pick the most popular attribute, which
        // remain the same.
        // Also ignored the attribute if player answered "not_sure" to avoid asking the same question
        fieldAndAttributeValuesToIgnore = userSession.fieldAndAttributeValuesToIgnore;
        if (answer === "yes" || answer === "not_sure") {
            fieldAndAttributeValuesToIgnore.push({
                field: userSession.field,
                attributeValue: userSession.chosenValue
            });
        }

        nextQuestion = QuestionSelector.nextQuestion(animalsToPlayWith, fieldAndAttributeValuesToIgnore);
        userSession.speech = nextQuestion.toText();
        console.log("Next question to ask: ", nextQuestion.toText());
    }
    return {
        nextQuestion: nextQuestion,
        userSession: userSession,
        animalsForNextRound: animalsToPlayWith,
        fieldAndAttributeValuesToIgnore: fieldAndAttributeValuesToIgnore
    };
};

module.exports = answerQuestionHandler;