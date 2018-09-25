'use strict';

const {WebhookClient} = require('dialogflow-fulfillment'),
    ResponseToApiAi = require("../models/response_to_api_ai"),
    GlossaryUtils = require('./glossary_utils'),
    proxyquire = require("proxyquire").noPreserveCache(),
    WebhookRequestBuilder = require('./WebhookRequestBuilder'),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai");

describe("enquire_glossary_intent_handler", () => {
    let agent, sandbox, enquireGlossaryIntentHandler;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        agent = createAgent(WebhookRequestBuilder.createEnquireGlossaryRequest());

    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should response with definition", async () => {
        enquireGlossaryIntentHandler = getHandler(true);
        await enquireGlossaryIntentHandler(agent);

        const responseTextObj = WebhookClient.prototype.add.args[0][0];
        responseTextObj.text.should.equal("definition of mammal Should we continue?");
        responseTextObj.platform.should.equal(agent.ACTIONS_ON_GOOGLE);
    });

    it("should response properly when definition is not found", async () => {
        enquireGlossaryIntentHandler = getHandler(false);
        await enquireGlossaryIntentHandler(agent);

        const responseTextObj = WebhookClient.prototype.add.args[0][0];
        responseTextObj.text.should.equal("I am sorry but I don't much about mammal. Should we continue?");
        responseTextObj.platform.should.equal(agent.ACTIONS_ON_GOOGLE);
    });

    const createAgent = (request) => {
        sandbox.spy(WebhookClient.prototype, 'add');
        return new WebhookClient({
            request: request,
            response: {}
        });
    };

    const getHandler = (definitionFound) => {
        const responseObj = definitionFound ?
            ResponseToApiAi.answerGlossaryEnquiry("mammal", "definition of mammal", []) :
            ResponseToApiAi.answerUnknownGlossaryEnquiry("mammal", []);

        sandbox.stub(GlossaryUtils, "buildSpeechForAnsweringGlossaryEnquiry")
            .returns(responseObj);

        return proxyquire("./enquire_glossary_intent_handler", {
            "./glossary_utils": GlossaryUtils
        });
    };
});