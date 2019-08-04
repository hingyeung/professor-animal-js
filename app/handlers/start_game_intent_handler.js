const AnimalListUtils = require("../services/animal_list_utils"),
    ResponseToApiAi = require("../models/response_to_api_ai"),
    UserSession = require("../models/UserSession"),
    DbService = require("../services/DbService"),
    errorHandler = require("./error_handler"),
    QuestionSelector = require("../services/question_selector"),
    sharedDataService = require('../services/shared_data_service'),
    uuid = require('../services/uuid'),
    MetricService = require('../services/metric_service'),
    { getLogger } = require('../services/logger_utils');

const logger = getLogger();

const startGameHandler = async (agent, fullAnimalList) => {
    let nextQuestion, userSession;
    const metricService = new MetricService(),
        dbService = new DbService(),
        fullAnimalNameList = AnimalListUtils.convertAnimalListToAnimalNameList(fullAnimalList);
    
    // this is a new game. set new gameId
    const gameId = uuid();
    sharedDataService.currentGameId = gameId;

    nextQuestion = QuestionSelector.nextQuestion(fullAnimalList, []);
    let responseToApiAi = ResponseToApiAi.fromQuestion(nextQuestion, agent.contexts);
    userSession = new UserSession(agent.session,
        fullAnimalNameList, nextQuestion.field, nextQuestion.chosenValue, [], responseToApiAi.speech, gameId);
    sharedDataService.currentGameId = userSession.gameId;

    logger.info('New game. full animal name list: %j', fullAnimalNameList);
    try {
        await dbService.saveSession(userSession);
        await metricService.newGameStarted();
    } catch (err) {
        errorHandler(agent, err);
    }

    responseToApiAi.contextOut.forEach(context => context.lifespan > 0 ? agent.setContext(context) : agent.clearContext(context.name));
    agent.add(responseToApiAi.speech);
};

module.exports = startGameHandler;
