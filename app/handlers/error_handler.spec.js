"use strict";

const WebhookRequestBuilder = require("./WebhookRequestBuilder"),
    errorHandler = require('./error_handler'),
    sinon = require('sinon'),
    sinonPromise = require('sinon-promise'),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    {WebhookClient} = require("dialogflow-fulfillment");

const sandbox = sinon.createSandbox();

describe("error_handler", function () {
    let agent;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox.spy(WebhookClient.prototype, 'end');
        agent = new WebhookClient({
            request: WebhookRequestBuilder.createStartGameWebhookRequest(),
            response: {}
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should end conversation", async () => {
        await errorHandler(agent, null);

        WebhookClient.prototype.end.should.have.been.called;
    });
});