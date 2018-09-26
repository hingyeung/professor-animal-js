const sinon = require("sinon"),
    sinonPromise = require("sinon-promise"),
    chai = require("chai"),
    sinonChai = require("sinon-chai"),
    proxyquire = require("proxyquire").noPreserveCache();

let createAnimalGenieApp, mockAnimalGenie, mockAnimalRepo, mockLoadAnimals, mockPlayByIntent;

describe("CreateAnimalGenieApp", function () {
    let originalEnv;

    beforeEach(() => {
        sinonPromise(sinon);
        chai.use(sinonChai);
        chai.should();

        const fullAnimalList = [];
        mockLoadAnimals = sinon.promise().resolves(fullAnimalList);
        mockPlayByIntent = sinon.stub();

        mockAnimalGenie = sinon.spy(function () {
            return {
                playByIntent: mockPlayByIntent
            };
        });
        mockAnimalRepo = function () {
            return {
                loadAnimals: mockLoadAnimals
            };
        };

        createAnimalGenieApp = proxyquire("./CreateAnimalGenieApp", {
            "./animal_genie": mockAnimalGenie,
            "./services/animal_repo": mockAnimalRepo
        });

        originalEnv = process.env;
    });

    afterEach(() => {
        process.env = Object.assign({}, originalEnv);
    });

    it("should load animal definition\"", function () {
        createAnimalGenieApp({}, {});
        mockLoadAnimals.calledOnce.should.equal(true);
    });

    it("should call instantiate AnimalGenie to play", async function () {
        process.env.NOTIFICATION_TOPIC_ARN = "snsTopicArn";
        const request = {a: 1}, response = {b: 2}, options = {notificationTopicArn: "snsTopicArn"};
        await createAnimalGenieApp(request, response, options);
        mockAnimalGenie.should.have.been.calledOnce;
        mockPlayByIntent.should.have.been.calledOnceWith(request, response, options);
    });
});