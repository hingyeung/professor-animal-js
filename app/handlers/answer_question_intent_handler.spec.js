'use strict';

const proxyquire = require('proxyquire').noPreserveCache(),
    sinon = require('sinon'),
    sinonPromise = require('sinon-promise'),
    Question = require('../models/question'),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    fs = require('fs'),
    UserSession = require('../models/UserSession'),
    {WebhookClient} = require('dialogflow-fulfillment'),
    AnimalFilter = require("../services/animal_filter"),
    WebhookRequestBuilder = require('./WebhookRequestBuilder'),
    AnimalListUtils = require('../services/animal_list_utils'),
    fullAnimalListFromFile = JSON.parse(fs.readFileSync('app/data/test-animals.json')),
    sandbox = sinon.createSandbox();

const USER_SESSION_ID = "projects/animalgenie20180906/agent/sessions/4f3a8260-5868-f5c1-f4dd-73215b1f0f56";

describe("answer_question_intent_handler", () => {

    let answerQuestionIntentHandler, nextQuestionStub, agent, mockDbService, mockQuestionSelector, nextQuestion, userSessionLoadedFromDB;
    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        userSessionLoadedFromDB = new UserSession(USER_SESSION_ID, ["Lion", "Eagle", "Elephant", "Shark"], "types", "A");
        mockDbService = createMockDbService(userSessionLoadedFromDB);

        nextQuestion = new Question("diet", ["A", "B"], "A");
        nextQuestionStub = sandbox.stub().returns(nextQuestion);
        mockQuestionSelector = {
            nextQuestion: nextQuestionStub
        };
        sandbox.spy(AnimalFilter, 'filter');
        answerQuestionIntentHandler = buildAnswerQuestionIntentHandler(
            mockDbService,
            mockQuestionSelector,
            AnimalFilter
        );

        sandbox.spy(WebhookClient.prototype, 'add');
        agent = new WebhookClient({
            request: WebhookRequestBuilder.createAnswerQuestionWebhookRequest("yes"),
            response: {}
        });

    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should load user session', () => {
        answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        mockDbService.prototype.getSession.should.have.been.calledWith(USER_SESSION_ID);
    });

    it("should get next question with QuestionSelector with animal list restored from session", async () => {
        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        nextQuestionStub.should.have.been.calledWith(
            AnimalListUtils.convertAnimalNameListToAnimalList(
                userSessionLoadedFromDB.animalNames, fullAnimalListFromFile),
            sinon.match.array);
    });

    it("should not ignore field and attribute value when user answer is \"no\" when getting the next queston", async () => {
        agent = new WebhookClient({
            request: WebhookRequestBuilder.createAnswerQuestionWebhookRequest("no"),
            response: {}
        });

        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        nextQuestionStub.should.have.been.calledWith(sinon.match.array, []);
    });

    ["yes", "not_sure"].forEach((answer) => {
        it(`should ignore field and attribute value when user answer is ${answer} when getting the next queston`, async () => {
            agent = new WebhookClient({
                request: WebhookRequestBuilder.createAnswerQuestionWebhookRequest(answer),
                response: {}
            });

            await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

            nextQuestionStub.should.have.been.calledWith(sinon.match.array, [{ attributeValue: "A", field: "types" }]);
        });
    });


    it('should save user session', async () => {
        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        mockDbService.prototype.saveSession.should.have.been.called;
    });

    it('should filter animals', async () => {
        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        AnimalFilter.filter.should.have.been.called;
    });

    it("should response with the next question", async () => {
        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        WebhookClient.prototype.add.should.have.been.calledWith("Does your animal eat A?");
    });

    it("should not filter animals when user is unsure about the answer of a question", async () => {
        agent = new WebhookClient({
            request: WebhookRequestBuilder.createAnswerQuestionWebhookRequest("not_sure"),
            response: {}
        });

        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        AnimalFilter.filter.should.not.have.been.called;
    });

    it("should be ready to make a guess when only one animal remaining", async () => {
        AnimalFilter.filter.restore();
        sandbox.stub(AnimalFilter, 'filter').returns([{name: "correct animal"}]);
        const answerQuestionIntentHandler = buildAnswerQuestionIntentHandler(
            createMockDbService(new UserSession("123", ["Lion", "Eagle"], "types", "A")),
            mockQuestionSelector,
            AnimalFilter
        );

        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        WebhookClient.prototype.add.should.have.been.calledWith("It is a correct animal. Am I right?");
    });

    it("should response with give-up message when it cannot determine the next question", async () => {
        const mockQS = {
            nextQuestion: sandbox.stub().returns(new Question(null, null, null, Question.GIVE_UP_MESSAGE))
        };
        const answerQuestionIntentHandler = buildAnswerQuestionIntentHandler(
            createMockDbService(new UserSession("123", ["Lion", "Eagle", "Elephant", "Shark"], "types", "A")),
            mockQS,
            AnimalFilter
        );

        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        WebhookClient.prototype.add.should.have.been.calledWith("I give up. I don't know which animal you are thinking about.");
    });

    const createMockDbService = (userSession) => {
        let mockDbService = sandbox.stub();
        mockDbService.prototype.getSession = sinon.promise().resolves(userSession);
        mockDbService.prototype.saveSession = sinon.promise().resolves();
        return mockDbService;
    };

    const buildAnswerQuestionIntentHandler = (mockDbService, mockQuestionSelector, mockAnimalFilter) => {
        return proxyquire('./answer_question_intent_handler', {
            '../services/DbService': mockDbService,
            "../services/question_selector": mockQuestionSelector,
            "../services/animal_filter": mockAnimalFilter
        });
    };
});