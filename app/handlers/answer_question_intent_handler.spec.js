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
    fullAnimalListFromFile = JSON.parse(fs.readFileSync('app/data/test-animals.json'));

const sandbox = sinon.createSandbox();

describe("answer_question_intent_handler", () => {

    let answerQuestionIntentHandler, nextQuestionStub, agent, mockDbService, mockQuestionSelector, nextQuestion;
    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        mockDbService = createMockDbService(new UserSession("123", ["Lion", "Eagle", "Elephant"], "types", "A"));

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

        mockDbService.prototype.getSession.should.have.been.called;
    });

    it('should get the next question with QuestionSelector', async () => {
        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        nextQuestionStub.should.have.been.called;
    });

    it('should save user session', async () => {
        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        mockDbService.prototype.saveSession.should.have.been.called;
    });

    it('should ask the next question', async () => {
        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        WebhookClient.prototype.add.should.have.been.calledWith("Does it eat A?");

        AnimalFilter.filter.should.have.been.called;
    });

    it("should be ready to make a guess when only one animal remaining", async () => {
        const answerQuestionIntentHandler = buildAnswerQuestionIntentHandler(
            createMockDbService(new UserSession("123", ["Lion", "Eagle"], "types", "A")),
            mockQuestionSelector,
            AnimalFilter
        );
        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        WebhookClient.prototype.add.should.have.been.calledWith("It is a Lion. Am I right?");
    });

    it("should not filter animal when user asks to repeat the question", async () => {
        agent = new WebhookClient({
            request: WebhookRequestBuilder.createAnswerQuestionWebhookRequest("not_sure"),
            response: {}
        });

        await answerQuestionIntentHandler(agent, fullAnimalListFromFile);

        AnimalFilter.filter.should.not.have.been.called;
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