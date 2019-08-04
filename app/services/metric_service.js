const AWS = require('aws-sdk');
const NAMESPACE = "ProfessorAnimal";

class MetricService {
    

    constructor() {
        let options = {};
        if (process.env.AWS_SAM_LOCAL) {
            let config = require(`../configs/${process.env.NODE_ENV}/config.json`);
            options.endpoint = config.cloudwatchEndpoint;
        }
        this.cloudwatch = new AWS.CloudWatch(options);
    }

    buildMetricData(namespace, metricName, dimensions) {
        return {
            MetricData: [ /* required */
                {
                    MetricName: metricName,
                    Dimensions: dimensions || [],
                    Unit: 'None',
                    Value: 1
                }
            ],
            Namespace: namespace
        };
    }

    newGameStarted() {
        const params = this.buildMetricData(NAMESPACE, "NewGameStarted", []);
    
        return this.cloudwatch.putMetricData(params).promise();
    }
}

module.exports = MetricService;