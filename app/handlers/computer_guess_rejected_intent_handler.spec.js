'use strict';

const proxyquire = require("proxyquire").noPreserveCache(),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    AWS = require("aws-sdk");

describe("computer_guess_rejected_intent_handler", function () {
    let stubSNSPublish, sandbox, handler;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        stubSNSPublish = sandbox.stub();
        sandbox.stub(AWS, 'SNS').returns({
            publish: stubSNSPublish
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

        stubSNSPublish.should.have.been.calledWith({
            "Message": sinon.match.string,
            "Subject": sinon.match.string,
            "TopicArn": 'snsTopicArn'
        });
    });
});