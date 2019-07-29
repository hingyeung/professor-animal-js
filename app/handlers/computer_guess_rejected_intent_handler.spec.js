'use strict';

const proxyquire = require("proxyquire").noPreserveCache(),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    WebhookRequestBuilder = require("./WebhookRequestBuilder"),
    {WebhookClient} = require("dialogflow-fulfillment"),
    AWS = require("aws-sdk"),
    UserSession = require('../models/UserSession');

describe("computer_guess_rejected_intent_handler", function () {
    let stubSNSPublish, sandbox, handler, agent, mockDbService;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        stubSNSPublish = sandbox.stub().returns({promise: sandbox.stub()});
        mockDbService = createMockDbService(new UserSession("123", ["Lion", "Eagle"], "types", "A"));
        sandbox.stub(AWS, 'SNS').returns({
            publish: stubSNSPublish
        });
        agent = createAgent(WebhookRequestBuilder.createStartGameWebhookRequest());
        handler = proxyquire("./computer_guess_rejected_intent_handler", {
            "aws-sdk": AWS,
            "../services/DbService": mockDbService
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should send notification to SNS topic", async () => {
        await handler(agent, 'animal', 'sessionId', 'snsTopicArn');

        stubSNSPublish.should.have.been.calledWith({
            "Message": sinon.match.string,
            "Subject": sinon.match.string,
            "TopicArn": 'snsTopicArn'
        });
    });

    it("should response to user properly", async () => {
        await handler(agent, 'animal', 'sessionId', 'snsTopicArn');

        WebhookClient.prototype.add.should.have.been.calledOnceWith(`I need to learn more about animal. Do you want to play again?`);
    });

    const createAgent = (request) => {
        sandbox.spy(WebhookClient.prototype, 'add');
        return new WebhookClient({
            request: request,
            response: {}
        });
    };

    const createMockDbService = (userSession) => {
        let mockDbService = sandbox.stub();
        mockDbService.prototype.getSession = sinon.promise().resolves(userSession);
        mockDbService.prototype.saveSession = sinon.promise().resolves();
        return mockDbService;
    };
});