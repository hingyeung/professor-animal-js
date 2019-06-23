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

    WebhookRequestBuilder = require('./WebhookRequestBuilder');


const FULL_ANIMAL_LIST_FROM_FILE = JSON.parse(fs.readFileSync('app/data/test-animals.json')),
    USER_SESSION_ID = "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56";

describe("start_game_intent_handler", () => {
    let startGameIntentHandler, agent, mockDbService, sandbox;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        sandbox = sinon.createSandbox();
        sandbox.resetHistory();

        sandbox.spy(WebhookClient.prototype, 'add');
        sandbox.spy(WebhookClient.prototype, 'clearContext');
        agent = new WebhookClient({
            request: WebhookRequestBuilder.createStartGameWebhookRequest(),
            response: {}
        });

        mockDbService = createMockDbService(new UserSession(USER_SESSION_ID, ["Lion", "Eagle", "Elephant"], "types", "A"));
        createMockQuestionSelector();
        startGameIntentHandler = proxyquire("./start_game_intent_handler", {
            "../services/question_selector": QuestionSelector,
            "../services/DbService": mockDbService
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should use QuestionSelector and full animal list from file to select the next question", async () => {
        await startGameIntentHandler(agent, FULL_ANIMAL_LIST_FROM_FILE);

        QuestionSelector.nextQuestion.should.have.been.calledWith(FULL_ANIMAL_LIST_FROM_FILE, []);
    });

    it("should save a new user session", async () => {
        await startGameIntentHandler(agent, FULL_ANIMAL_LIST_FROM_FILE);

        mockDbService.prototype.saveSession.should.have.been.calledWith(
            new UserSession(USER_SESSION_ID,
                ["Lion", "Elephant", "Chameleon", "Shark", "Penguin", "Eagle"],
                "diet", "A", [], "Does it eat A?"));

        mockDbService.prototype.getSession.should.not.have.been.called;
    });

    it("should response with the next question", async () => {
        await startGameIntentHandler(agent, FULL_ANIMAL_LIST_FROM_FILE);

        WebhookClient.prototype.add.should.have.been.calledWith("Does it eat A?");
    });

    it("should clear contexts with lifespan more than 0 in the agent", async () => {
        await startGameIntentHandler(agent, FULL_ANIMAL_LIST_FROM_FILE);

        WebhookClient.prototype.clearContext.should.have.been.calledWith("clearme");
    });

    const createMockDbService = (userSession) => {
        let mockDbService = sandbox.stub();
        mockDbService.prototype.getSession = sandbox.stub().resolves(userSession);
        mockDbService.prototype.saveSession = sandbox.stub().resolves();
        return mockDbService;
    };

    const createMockQuestionSelector = () => {
        sandbox.stub(QuestionSelector, 'nextQuestion')
            .returns(new Question("diet", ["A", "B"], "A"));
    };
});