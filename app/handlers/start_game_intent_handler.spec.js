"use strict";

const proxyquire = require("proxyquire").noPreserveCache(),
    sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    Question = require("../models/question"),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    fs = require("fs"),
    UserSession = require("../models/UserSession"),
    QuestionSelector = require("../services/question_selector"),
    {WebhookClient} = require("dialogflow-fulfillment"),
    WebhookRequestBuilder = require('./WebhookRequestBuilder'),
    fullAnimalListFromFile = JSON.parse(fs.readFileSync('app/data/test-animals.json'));

const sandbox = sinon.createSandbox();

describe("start_game_intent_handler", () => {
    let startGameIntentHandler, agent, mockDbService;
    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox.spy(WebhookClient.prototype, 'add');
        agent = new WebhookClient({
            request: WebhookRequestBuilder.createStartGameWebhookRequest(),
            response: {}
        });

        mockDbService = createMockDbService(new UserSession("123", ["Lion", "Eagle", "Elephant"], "types", "A"));

        startGameIntentHandler = proxyquire("./start_game_intent_handler", {
            "../services/question_selector":
                sandbox.stub(QuestionSelector, "nextQuestion")
                    .returns(new Question("diet", ["A", "B"], "A")),
            "../services/DbService": mockDbService
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should use QuestionSelector to select the next question", () => {
        startGameIntentHandler(agent, fullAnimalListFromFile);

        QuestionSelector.nextQuestion.should.have.been.calledWith(fullAnimalListFromFile, []);
    });

    it("should save a new user session", () => {
        startGameIntentHandler(agent, fullAnimalListFromFile);

        mockDbService.prototype.saveSession.should.have.been.called;
    });

    it("should response with the next question", async () => {
        await startGameIntentHandler(agent, fullAnimalListFromFile);

        WebhookClient.prototype.add.should.have.been.called;
    });

    const createMockDbService = (userSession) => {
        let mockDbService = sandbox.stub();
        mockDbService.prototype.getSession = sinon.promise().resolves(userSession);
        mockDbService.prototype.saveSession = sinon.promise().resolves();
        return mockDbService;
    };
});