# Professor Animal

## What is it?
This is a [game](https://assistant.google.com/services/a/uid/0000000d710d70f0) developed for Google Assistant and can be played on Google Home, Android devices and iOS devices with Google Assistant app. This is a classic **Who am I?** game and designed with Voice UI in mind.

The game asks the player a series of questions such as "Can it fly?", "Does it have tail?" and "Is it considered dangerous to human?" and expects the player to answer "yes" or "no" to each question. The aim is to have the game to correctly guess the animal the player has in mind. The game can also provide definition on defined keywords during the game when player ask questions such as "What is mammal?". 

This game is best suited for children of age 5 or older.

## How do I to play it?
On Android device
1. Start conversation with Google Assistant by either using the [home button](https://support.google.com/assistant/answer/7172657?co=GENIE.Platform%3DAndroid&oco=0) or using the dedicated [Google Assistant app](https://play.google.com/store/apps/details?id=com.google.android.apps.googleassistant&hl=en).
2. Type or say "**Let me talk to Professor Animal**".

On iOS device
1. Start the [Google Assistant app](https://itunes.apple.com/au/app/google-assistant/id1220976145?mt=8).
2. Type or say "**Let me talk to Professor Animal**".

On Google Home
1. [Start conversation](https://support.google.com/googlehome/answer/7207759?hl=en-AU&ref_topic=7196346) with Google Home.
2. Say "**Let me talk to Professor Animal**".

## Development
This project's core logic runs as a Lambda function in AWS, and expects input from [Dialogflow](https://dialogflow.com) natural language processing (NPL) engine. The response from the Lambda function is also sent back to Dialogflow for text-to-speech and other conversation context tracking. It uses DynamoDB for session storage. The code is written in NodeJS.

#### Running locally
1. Install dependencies: `npm install`
2. Install AWS SAM CLI: `pip install --user aws-sam-cli` (https://github.com/awslabs/aws-sam-cli#installation)
3. Install localstack: `pip install localstack` (https://github.com/localstack/localstack#installing)
4. Start localstack: `npm run start-localstack`
5. Seed initial data: `npm run seed-data`
6. Use one of the npm tasks for local testing. e.g. `run invoke-lambda-with-initial-event`.

#### Useful npm tasks for building and deploying
`npm run package ${SRC_S3_BUCKET}` Package the code in zip file, generate CloudFormation template, which expects to find Lambda function source in `s3://${SRC_S3_BUCKET}/professor-animal/src`.

`npm run upload-to-s3 ${SRC_S3_BUCKET}` Upload zip file generated from `package` task to AWS S3. The zipped file will be uploaded to `s3://${SRC_S3_BUCKET}/professor-animal/src/`

`npm run cf-deploy-stack ${BUILD_NUMBER} ${SRC_S3_BUCKET} ${DATA_S3_BUCKET} ${STACK_NAME}` Create a stack with API Gateway, Lambda function with source from `s3://${SRC_S3_BUCKET}/professor-animal/src/` and expect to find animal definition data in `s3://${DATA_S3_BUCKET}/professor-animal/data/`

`npm run cf-update-stack ${BUILD_NUMBER} ${SRC_S3_BUCKET} ${DATA_S3_BUCKET} ${STACK_NAME}` Update an existing stack. Upload the specified build to S3 before running this task.

#### Useful npm tasks for local testing
These tasks are useful for testing the app using local Lambda and DynamoDB:

`npm run start-localstack` Starts localstack Docker container to support local Lambda function testing. DynamoDB and S3 data are only persisted in memory and will be discarded when localstack container is stopped.

`npm run seed-data` Seed initial table and data in localstack DynamoDB and S3.

`npm run invoke-lambda-with-initial-event` Invoke Lambda function to reset state in local DynamoDB, ready for new game.

`npm run invoke-lambda-with-followup-yes` Invoke Lambda function to answer "Yes" to the current question.

`npm run invoke-lambda-with-followup-no` Invoke Lambda function to answer "No" to the current question.

`npm run invoke-lambda-with-followup-repeat` Invoke Lambda function to send "Repeat" action to the current question, effectively asking the app to repeat its last message.

`npm run invoke-lambda-with-glossary-enquiry` Invoke Lambda function to ask for definition of a known keyword. Keywords are defined in Google Action. I have plan to incorporate the keyword definition into a this code base.

## License
ISC

## Feedback
Drop me a line at professor.animal@samuelli.net