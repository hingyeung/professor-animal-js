'use strict';

const AWS = require('aws-sdk'),
    fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    _ = require('lodash');

function AnimalRepo(datafile) {
    let options = {
        apiVersion: '2006-03-01',
        // https://github.com/localstack/localstack/issues/43#issuecomment-375828074
        s3ForcePathStyle: true
    };

    if (process.env.AWS_SAM_LOCAL) {
        let config = require(`../configs/${process.env.NODE_ENV}/config.json`);
        options.endpoint = config.s3Endpoint;
    }

    this.s3 = new AWS.S3(options);
    // this.datafile = !datafile ? path.join(__dirname, '../data/animals.json') : datafile;
    // this.animalsLoadedFromFile = JSON.parse(fs.readFileSync(this.datafile));
}

AnimalRepo.prototype.loadAnimals = function () {
    const s3Params = {
        Bucket: process.env.DATA_S3_BUCKET,
        Key: process.env.ANIMAL_DEFINITION_S3_KEY
    };
    return Q.ninvoke(this.s3, "getObject", s3Params)
        .then((data) => {
            return Q(JSON.parse(data.Body.toString('utf-8')));
        });
};

AnimalRepo.prototype.allAnimals = function () {
    return this.animalsLoadedFromFile;
};

AnimalRepo.prototype.convertAnimalListToAnimalNameList = function (animalList) {
    return _.map(animalList, function (animal) {
        return animal.name;
    });
};

module.exports = AnimalRepo;
