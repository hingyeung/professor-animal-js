'use strict';

const AWS = require('aws-sdk'),
    Q = require('q'),
    {getLogger} = require('./logger_utils');

const logger = getLogger();

function AnimalRepo(datafile) {
    let options = {
        apiVersion: '2006-03-01',
        // https://github.com/localstack/localstack/issues/43#issuecomment-375828074
        s3ForcePathStyle: true
    };

    if (process.env.AWS_SAM_LOCAL) {
        const configFile = "../configs/local/config.json";
        logger.info(`Loading ${configFile}...`);
        const config = require(configFile);
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

module.exports = AnimalRepo;
