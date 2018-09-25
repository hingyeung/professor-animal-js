"use strict";
const proxyquire = require("proxyquire").noPreserveCache(),
    UserSession = require('../models/UserSession'),
    {WebhookClient} = require('dialogflow-fulfillment'),
    WebhookRequestBuilder = require('./WebhookRequestBuilder'),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai");

describe("repeat_question_intent_handler", function () {
    let sandbox, agent, repeatQuestionHandler;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        repeatQuestionHandler = proxyquire('./repeat_question_intent_handler', {
            "../services/DbService": createMockDbService()
        });
        sandbox.spy(WebhookClient.prototype, 'add');
        agent = new WebhookClient({
            request: WebhookRequestBuilder.createAnswerQuestionRepeatWebhookRequest(),
            response: {}
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should repeat the same question stored in user session", async function () {
        await repeatQuestionHandler(agent);

        WebhookClient.prototype.add.should.have.been.calledWith('repeat after me');
    });

    const createMockDbService = () => {
        let mockDbService = sandbox.stub();
        mockDbService.prototype.getSession = sandbox.stub().resolves(new UserSession(null, null, null, null, null, "repeat after me"));
        return mockDbService;
    };
});