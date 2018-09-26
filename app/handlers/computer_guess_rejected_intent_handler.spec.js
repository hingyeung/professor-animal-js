'use strict';

const proxyquire = require("proxyquire").noPreserveCache(),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    AWS = require("aws-sdk");

describe("computer_guess_rejected_intent_handler", function () {
    let stubPublish, sandbox, handler;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        stubPublish = sandbox.stub();
        sandbox.stub(AWS, 'SNS').returns({
            publish: stubPublish
        });
        handler = proxyquire("./computer_guess_rejected_intent_handler", {
            "aws-sdk": AWS
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should send notification to SNS topic", () => {
        handler('animal', 'snsTopicArn');

        stubPublish.should.have.been.calledWith({
            "Message": sinon.match.string,
            "Subject": sinon.match.string,
            "TopicArn": 'snsTopicArn'
        });
    });
});