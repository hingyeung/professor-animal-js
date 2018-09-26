'use strict';

const proxyquire = require("proxyquire").noPreserveCache(),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    WebhookRequestBuilder = require("./WebhookRequestBuilder"),
    {WebhookClient} = require("dialogflow-fulfillment"),
    AWS = require("aws-sdk");

describe("computer_guess_rejected_intent_handler", function () {
    let stubSNSPublish, sandbox, handler, agent;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        stubSNSPublish = sandbox.stub();
        sandbox.stub(AWS, 'SNS').returns({
            publish: stubSNSPublish
        });
        agent = createAgent(WebhookRequestBuilder.createStartGameWebhookRequest());
        handler = proxyquire("./computer_guess_rejected_intent_handler", {
            "aws-sdk": AWS
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should send notification to SNS topic", () => {
        handler(agent, 'animal', 'snsTopicArn');

        stubSNSPublish.should.have.been.calledWith({
            "Message": sinon.match.string,
            "Subject": sinon.match.string,
            "TopicArn": 'snsTopicArn'
        });
    });

    it("should response to user properly", () => {
        handler(agent, 'animal', 'snsTopicArn');

        WebhookClient.prototype.add.should.have.been.calledOnceWith(`I need to learn more about animal. Do you want to play again?`);
    });

    const createAgent = (request) => {
        sandbox.spy(WebhookClient.prototype, 'add');
        return new WebhookClient({
            request: request,
            response: {}
        });
    };
});