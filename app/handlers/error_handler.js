const {getLogger} = require('../services/logger_utils');

const logger = getLogger();

const errorHandler = (agent, err) => {
    logger.error('Unknown error', err);
    agent.end("Something is broken on my side. Sorry for leaving you like this. Bye.");
};

module.exports = errorHandler;