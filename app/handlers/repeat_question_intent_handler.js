"use strict";

const errorHandler = require("./error_handler"),
    ResponseToApiAi = require("../models/response_to_api_ai"),
    DbService = require("../services/DbService");

const repeatQuestionIntentHandler = async function (agent) {
    try {
        const dbService = new DbService(),
            userSession = await dbService.getSession(agent.session);

        const response = ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, agent.contexts);
        response.contextOut.forEach(context => agent.setContext(context));
        agent.add(response.speech);
    } catch (err) {
        errorHandler(err);
    }
};

module.exports = repeatQuestionIntentHandler;