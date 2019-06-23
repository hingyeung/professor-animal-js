const AnimalListUtils = require("../services/animal_list_utils"),
    ResponseToApiAi = require("../models/response_to_api_ai"),
    UserSession = require("../models/UserSession"),
    DbService = require("../services/DbService"),
    errorHandler = require("./error_handler"),
    QuestionSelector = require("../services/question_selector");

const startGameHandler = async (agent, fullAnimalList) => {
    let nextQuestion, userSession;
    const dbService = new DbService(),
        fullAnimalNameList = AnimalListUtils.convertAnimalListToAnimalNameList(fullAnimalList);
    // this is a new game, get the next question using animals from data file.
    console.log(fullAnimalNameList, fullAnimalNameList.length);
    nextQuestion = QuestionSelector.nextQuestion(fullAnimalList, []);
    let responseToApiAi = ResponseToApiAi.fromQuestion(nextQuestion, agent.contexts);
    userSession = new UserSession(agent.session,
        fullAnimalNameList, nextQuestion.field, nextQuestion.chosenValue, [], responseToApiAi.speech);
    try {
        await dbService.saveSession(userSession);
    } catch (err) {
        errorHandler(agent, err);
    }

    responseToApiAi.contextOut.forEach(context => context.lifespan > 0 ? agent.setContext(context) : agent.clearContext(context.name));
    agent.add(responseToApiAi.speech);
};

module.exports = startGameHandler;
