"use strict";

const {WebhookClient} = require("dialogflow-fulfillment"),
    WebhookRequestBuilder = require("./WebhookRequestBuilder"),
    GlossaryUtils = require("./glossary_utils"),
    ResponseToApiAi = require("../models/response_to_api_ai"),
    proxyquire = require("proxyquire").noPreserveCache(),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai");

describe("enquire_glossary_for_term_in_context_intent_handler", function () {
    let agent, sandbox;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should response with definition of term found in context", async function () {
        agent = createAgent(WebhookRequestBuilder.createAnswerQuestionWebhookRequest("yes"));

        await getHandler(true, "mammal")(agent);

        const responseTextObj = WebhookClient.prototype.add.args[0][0];
        responseTextObj.text.should.equal("definition of mammal Should we continue?");
        responseTextObj.platform.should.equal(agent.ACTIONS_ON_GOOGLE);
    });

    it("should response properly when definition is not found", async () => {
        agent = createAgent(WebhookRequestBuilder.createAnswerQuestionWebhookRequest("yes"));

        await getHandler(false, "mammal")(agent);

        const responseTextObj = WebhookClient.prototype.add.args[0][0];
        responseTextObj.text.should.equal("I am sorry but I don't much about mammal. Should we continue?");
        responseTextObj.platform.should.equal(agent.ACTIONS_ON_GOOGLE);
    });

    it('should respond properly chosenValue of the current question is not in the context', async () => {
        agent = createAgent(WebhookRequestBuilder.createAnswerQuestionWebhookRequestWithoutCurrentFieldAndChosenValueInContext("yes"));

        await getHandler(false, null)(agent);
        const responseTextObj = WebhookClient.prototype.add.args[0][0];
        responseTextObj.text.should.equal("I am sorry but I don't much about that. Should we continue?");
        responseTextObj.platform.should.equal(agent.ACTIONS_ON_GOOGLE);
    });

    const createAgent = (request) => {
        sandbox.spy(WebhookClient.prototype, 'add');
        return new WebhookClient({
            request: request,
            response: {}
        });
    };

    const getHandler = (definitionFound, term) => {
        const responseObj = definitionFound ?
            ResponseToApiAi.answerGlossaryEnquiry(term, "definition of mammal", []) :
            ResponseToApiAi.answerUnknownGlossaryEnquiry(term, []);

        sandbox.stub(GlossaryUtils, "buildSpeechForAnsweringGlossaryEnquiryForTerm")
            .returns(responseObj);

        return proxyquire("./enquire_glossary_for_term_in_context_intent_handler", {
            "./glossary_utils": GlossaryUtils
        });
    };
});