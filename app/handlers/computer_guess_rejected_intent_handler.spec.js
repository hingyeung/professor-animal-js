'use strict';

const proxyquire = require("proxyquire").noPreserveCache(),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    AWS = require("aws-sdk");

describe("computer_guess_rejected_intent_handler", function () {
    let sandbox, handler;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        // TODO https://github.com/dwyl/aws-sdk-mock#readme
        sandbox.stub(AWS.SNS.prototype, 'publish');
        handler = proxyquire("./computer_guess_rejected_intent_handler", {
            "aws-sdk": AWS
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should send notification to SNS topic", () => {
        handler('animal', 'snsTopicArn');

        AWS.SNS.prototype.publish.should.have.been.called;
    });
});