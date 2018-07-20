'use strict';

const AWS = require('aws-sdk'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

function AnimalRepo(datafile) {
    let options = {apiVersion: '2006-03-01'};
    if (process.env.AWS_SAM_LOCAL) {
        let config = require(`../configs/${process.env.NODE_ENV}/config.json`);
        options.endpoint = config.s3Endpoint;
    }
    this.datafile = !datafile ? path.join(__dirname, '../data/animals.json') : datafile;
    this.animalsLoadedFromFile = JSON.parse(fs.readFileSync(this.datafile));
    this.s3 = new AWS.S3(options);
}

AnimalRepo.prototype.allAnimals = function () {
      this.s3.listBuckets(function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Bucket List", data.Buckets);
        }
      });

    return this.animalsLoadedFromFile;
};

AnimalRepo.prototype.convertAnimalListToAnimalNameList = function (animalList) {
    return _.map(animalList, function (animal) {
        return animal.name;
    });
};

AnimalRepo.prototype.convertAnimalNameListToAnimalList = function (animalNameList) {
    let animalList = [];
    this.animalsLoadedFromFile.forEach(function (animal) {
        if (_.includes(animalNameList, animal.name)) {
            animalList.push(animal);
        }
    });
    return animalList;
};

module.exports = AnimalRepo;
