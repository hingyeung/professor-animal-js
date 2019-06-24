"use strict";

const {WebhookClient} = require("dialogflow-fulfillment"),
    startGameIntentHandler = require("./handlers/start_game_intent_handler"),
    answerQuestionHandler = require("./handlers/answer_question_intent_handler"),
    repeatQuestionIntentHandler = require('./handlers/repeat_question_intent_handler'),
    enquireGlossaryIntentHandler = require('./handlers/enquire_glossary_intent_handler'),
    enquireGlossaryForTermInContextIntentHandler = require('./handlers/enquire_glossary_for_term_in_context_intent_handler'),
    sharedDataService = require('./services/shared_data_service'),
    {getLogger} = require('./services/logger_utils'),
    computerGuessRejectedIntentHandler = require('./handlers/computer_guess_rejected_intent_handler');

const logger = getLogger();

function AnimalGenie(fullAnimalList) {
    this.fullAnimalList = fullAnimalList;
}

AnimalGenie.prototype.playByIntent = function(request, response, options) {
    logger.info('NODE_ENV: %s', process.env.NODE_ENV);

    // winston console transport does not log to aws lambda output without this hack
    // https://github.com/winstonjs/winston/issues/1594#issue-408239025
    // Need original console for unit test in dev mode
    if (process.env.NODE_ENV !== 'dev') {
        delete console['_stdout'];
        delete console['_stderr'];
    }

    logger.info('options: %o', options);
    const agent = new WebhookClient({request: request, response: response}),
        intentMap = new Map();
    if (agent.agentVersion === 1) {
        agent.session = request.body.sessionId;
    }

    // action: startgame
    intentMap.set("Test Game Reset", async () => {
        await startGameIntentHandler(agent, this.fullAnimalList);
    });
    intentMap.set("Default Welcome Intent - ready to pick animal - yes", async () => {
        await startGameIntentHandler(agent, this.fullAnimalList);
    });

    // action: answer_question yes / no / not_sure / repeat
    intentMap.set("Response.To.InGameQuestion.No", async () => {
        await answerQuestionHandler(agent, this.fullAnimalList);
    });
    intentMap.set("Response.To.InGameQuestion.Yes", async () => {
        await answerQuestionHandler(agent, this.fullAnimalList);
    });
    intentMap.set("Response.To.InGameQuestion.NotSure", async () => {
        await answerQuestionHandler(agent, this.fullAnimalList);
    });
    intentMap.set("Response.To.InGameQuestion.Repeat", async () => {
        await repeatQuestionIntentHandler(agent);
    });

    // answer_question_glossary_enquiry
    intentMap.set("Enquire.Glossary", async () => {
        await enquireGlossaryIntentHandler(agent);
    });
    // EnquireGlossary.EnquireGlossary-yes
    intentMap.set("Enquire.Glossary.Continue - yes", async () => {
        await repeatQuestionIntentHandler(agent, this.fullAnimalList);
    });
    // answer_question_glossary_enquiry_of_the_current_question_value
    intentMap.set("Enquire.Glossary.For.Term.In.Current.Question", async () => {
        await enquireGlossaryForTermInContextIntentHandler(agent);
    });
    intentMap.set("Enquire.Glossary.For.Term.In.Current.Question - yes", async () => {
        await repeatQuestionIntentHandler(agent);
    });

    // computer_made_incorrect_guess
    intentMap.set("Response.To.ComputerGuess.Reject", async () => {
        const correctAnimal = agent.parameters.animal;
        // that.notifyIncorrectGuess(correctAnimal, options.notificationTopicArn);
        await computerGuessRejectedIntentHandler(agent, correctAnimal, sharedDataService.currentSessionId, options.notificationTopicArn);
    });

    // default fallback


    // intentMap.set('Test Game Reset', () => agent.add('start the game...'));
    agent.handleRequest(intentMap);
};

module.exports = AnimalGenie;