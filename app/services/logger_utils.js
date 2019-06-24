const { createLogger, format, transports } = require('winston');

// const myFormat = printf(({ level, message, label, timestamp }) => {
//     return `${timestamp} [${label}] ${level}: ${message}`;
// });

const sharedDataService = require('./shared_data_service');

const truncateSessionId = (sessionId) => {
    return sessionId ? sessionId.substr(Math.max(0, sessionId.length - TRUNCATED_LENGTH), TRUNCATED_LENGTH) : '';
};
const injectSessionId = format((info, opts) => {
    if (info.meta && info.meta instanceof Error) {
        info.message = `${info.message} ${info.meta.stack}`;
    }

    info.message = `${truncateSessionId(sharedDataService.currentSessionId)} ${info.message}`;
    return info;
})();

const TRUNCATED_LENGTH = 4;


const getLogger = () => {
    return createLogger({
        level: 'debug',
        format: format.combine(
            format.splat(),
            // label({ label: truncateSessionId(sharedDataService.currentSessionId) }),
            // myFormat
            injectSessionId,
            format.simple()
        ),
        transports: [
            new transports.Console(),
        ]
    });
};

module.exports = { getLogger };