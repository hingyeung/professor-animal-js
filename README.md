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
This project's core logic runs as a Lambda function in AWS, and relies on [Dialogflow](https://dialogflow.com) for natural language processing (NPL). It uses DynamoDB for session storage. The code is written in NodeJS.
#### Running locally
1. Install dependencies: `npm install`
2. Start the local [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
3. Use one of the npm tasks for local testing. e.g. `npm run-local-initial`.

#### Useful npm tasks for building
`npm package` Package the code in zip file, ready for uploading to AWS Lambda.

`npm upload-package-to-lambda $AWS_LAMBDA_ARN` Upload zip file generated from `package` task to AWS Lambda.
#### Useful npm tasks for local testing
These tasks are useful for testing the app using local Lambda and DynamoDB:

`npm run-local-initial` Reset state in local DynamoDB, ready for new game.

`npm run-local-followup-yes` Answer "Yes" to the current question.

`npm run-local-followup-no` Answer "No" to the current question.

`npm run-local-followup-repeat` Send "Repeat" action to the current question, effectively asking the app to repeat its last message.

`npm run-local-glossary-enquiry` Ask for definition of a known keyword. Keywords are defined in Google Action. I have plan to incorporate the keyword definition into a this code base.

## Feedback
Drop me a line at professor.animal@samuelli.net