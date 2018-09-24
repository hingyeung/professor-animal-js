"use strict";

const _ = require("lodash"),
    ResponseToApiAi = require("./models/response_to_api_ai"),
    Q = require("q"),
    GlossaryRepo = require("./services/glossary_repo"),
    DbService = require("./services/DbService"),
    {WebhookClient, Text} = require("dialogflow-fulfillment"),
    startGameIntentHandler = require("./handlers/start_game_intent_handler"),
    answerQuestionHandler = require("./handlers/answer_question_intent_handler"),
    AWS = require("aws-sdk");

function AnimalGenie(fullAnimalList) {
    this.fullAnimalList = fullAnimalList;
}

// TODO: move this to a separate intent handler
// else if (event.result.action === ActionType.ANSWER_QUESTION_GLOSSARY_ENQIRY_OF_THE_CURRENT_QUESTION_VALUE) {
//     const term = that.extractQuestionChosenValueFromContext(event.result.contexts);
//     that.buildSpeechForAnsweringGlossaryEnquiryForTerm(term, event, callback);
// }
// AnimalGenie.prototype.extractQuestionChosenValueFromContext = function(contextList) {
//     let chosenValue = null;
//     _.find(contextList, function(context) {
//         const matched = context.name.match(/^question.chosenValue:(.+)$/);
//         chosenValue = matched ? matched[1] : null;
//         return matched;
//     });
//
//     return chosenValue;
// };

AnimalGenie.prototype.playByIntent = function(request, response, options) {
    console.log(options);
    const agent = new WebhookClient({request: request, response: response}),
        intentMap = new Map();

    let that = this;

    // action: startgame
    intentMap.set("Test Game Reset", async () => {
        await startGameIntentHandler(agent, this.fullAnimalList);
    });
    intentMap.set("Default Welcome Intent - ready to pick animal - yes", async () => {
        await startGameIntentHandler(agent, this.fullAnimalList);
    });

    const repeatQuestion = async function() {
        try {
            const userSession = await that.loadSession(agent.session);
            // that.buildResponseToApiAiForRepeatingLastSpeech(event, callback);
            const response = ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, agent.contexts);
            response.contextOut.forEach(context => agent.setContext(context));
            agent.add(response.speech);
        } catch (err) {
            crashOut(err);
        }
    };

    const crashOut = function(err) {
        console.log(err);
        agent.end("Something is broken on my side. Sorry for leaving you like this. Bye.");
    };

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
    intentMap.set("Response.To.InGameQuestion.Repeat", repeatQuestion);

    // answer_question_glossary_enquiry
    // that.buildSpeechForAnsweringGlossaryEnquiry(event, callback);
    intentMap.set("Enquire.Glossary", () => {
        const term = agent.parameters.term,
            contextsIn = agent.contexts;
        const responseToApiAi = that.buildSpeechForAnsweringGlossaryEnquiry(term, contextsIn);

        responseToApiAi.contextOut.forEach(context => agent.setContext(context));
        const text = new Text({
            text: responseToApiAi.displayText,
            ssml: responseToApiAi.speech,
            platform: agent.ACTIONS_ON_GOOGLE
        });

        agent.add(text);
    });
    // EnquireGlossary.EnquireGlossary-yes
    intentMap.set("Enquire.Glossary.Continue - yes", async () => {
        await answerQuestionHandler(agent, this.fullAnimalList);
    });

    // computer_made_incorrect_guess
    intentMap.set("Response.To.ComputerGuess.Reject", () => {
        const correctAnimal = agent.parameters.animal;
        that.notifyIncorrectGuess(correctAnimal, options.notificationTopicArn);
    });

    // ActionType.ANSWER_QUESTION_GLOSSARY_ENQIRY_OF_THE_CURRENT_QUESTION_VALUE

    // default fallback


    // intentMap.set('Test Game Reset', () => agent.add('start the game...'));
    agent.handleRequest(intentMap);
};

AnimalGenie.prototype.buildSpeechForAnsweringGlossaryEnquiryForTerm = function(term, contextsIn) {
    const glossaryRepo = new GlossaryRepo();
    let definition = glossaryRepo.getDefinition(term);
    if (definition) {
        return ResponseToApiAi.answerGlossaryEnquiry(term, definition, contextsIn);
    } else {
        return ResponseToApiAi.answerUnknownGlossaryEnquiry(term, contextsIn);
    }
};

AnimalGenie.prototype.buildSpeechForAnsweringGlossaryEnquiry = function(term, contextsIn) {
    let that = this;
    return that.buildSpeechForAnsweringGlossaryEnquiryForTerm(term, contextsIn);
};

AnimalGenie.prototype.buildResponseToApiAiForRepeatingLastSpeech = function(event, callback) {
    return function (userSession) {
        callback(null, ResponseToApiAi.repeatSpeechFromUserSesssion(userSession, event));
    };
};

AnimalGenie.prototype.loadSession = function(sessionId) {
    return (new DbService()).getSession(sessionId);
};

AnimalGenie.prototype.notifyIncorrectGuess = function (animal, topicArn) {
    let sns = new AWS.SNS();
    console.dir(topicArn);
    let params = {
        Message: "Professor Animal has made an incorrect guess. The answer was " + animal,
        Subject: "Professor Animal has just lost a game.",
        TopicArn: topicArn
    };
    sns.publish(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
};

module.exports = AnimalGenie;