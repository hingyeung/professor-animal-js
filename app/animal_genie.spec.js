'use strict';

const {WebhookClient} = require('dialogflow-fulfillment'),
    WebhookRequestBuilder = require('./handlers/WebhookRequestBuilder'),
    proxyquire = require("proxyquire").noPreserveCache(),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai");

describe('AnimalGenie', function () {
    let sandbox, AnimalGenie;

    beforeEach(function () {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        WebhookClient.prototype.handleRequest = sandbox.stub();
        AnimalGenie = proxyquire("./animal_genie", {
            "dialogflow-fulfillment": {WebhookClient}
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should handle request using Dialogflow API", async () => {
        await new AnimalGenie().playByIntent(WebhookRequestBuilder.createStartGameWebhookRequest(), {}, {});

        WebhookClient.prototype.handleRequest.should.have.been.calledOnce;
    });

    it("should register handlers for all 10 supported intents", async () => {
        const INTENTS = [
            "Test Game Reset",
            "Default Welcome Intent - ready to pick animal - yes",
            "Response.To.InGameQuestion.No",
            "Response.To.InGameQuestion.Yes",
            "Response.To.InGameQuestion.NotSure",
            "Response.To.InGameQuestion.Repeat",
            "Enquire.Glossary",
            "Enquire.Glossary.Continue - yes",
            "Enquire.Glossary.For.Term.In.Current.Question",
            "Response.To.ComputerGuess.Reject"
        ];
        await new AnimalGenie().playByIntent(WebhookRequestBuilder.createStartGameWebhookRequest(), {}, {});

        const intentMap = WebhookClient.prototype.handleRequest.args[0][0];

        INTENTS.forEach((intent) => {
            intentMap.has(intent).should.equal(true);
        });

    });
});