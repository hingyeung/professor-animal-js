"use strict";

const AWS = require("aws-sdk"),
    DbService = require("../services/DbService"),
    {getLogger} = require('../services/logger_utils');

const logger = getLogger();

const loadSession = (sessionId) => {
    return (new DbService()).getSession(sessionId);
};

const getSNSOptions = () => {
    if (process.env.AWS_SAM_LOCAL) {
        const configFile = "../configs/local/config.json";
        logger.info(`Loading ${configFile}...`);
        const config = require(configFile);
        return {
            endpoint: config.snsEndpoint
        };
    } else {
        return {};
    }
};

const computerGuessRejectedIntentHandler = async (agent, animal, gameId, snsTopicArn) => {
    const sns = new AWS.SNS(getSNSOptions());
    let snsParams;
    try {
        const userSession = await loadSession(agent.session);
        const intro = `Professor Animal has made an incorrect guess. The answer was ${animal}. Game ID: ${gameId}`;
        const history = JSON.stringify(userSession.interactionHistory, null, '\t');
        
        snsParams = {
            Message: `${intro}\n\n${history}`,
            Subject: "Professor Animal has just lost a game.",
            TopicArn: snsTopicArn
        };
    } catch (err) {
        logger.error('failed to load user session', err);
    }

    try {
        await sns.publish(snsParams).promise();
        logger.info(`SNS message published for incorrect guess. Expected answer: ${animal}`);
        agent.add(`I need to learn more about ${animal}. Do you want to play again?`);
    } catch (err) {
        logger.error('SNS publish error', err); // an error occurred
    }
};

module.exports = computerGuessRejectedIntentHandler;