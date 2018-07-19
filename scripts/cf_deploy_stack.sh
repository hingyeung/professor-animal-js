#!/bin/bash
set -e

source `dirname "$0"`/utils.sh

BUILD_NUMBER=$1    # build number (e.g. "9c1a339" or "9c1a339-snapshot")
S3_BUCKET=$2
DATA_S3_BUCKET=$3
STACK_NAME=$4
AWS_ACCOUNT_ID=$5
AWS_REGION=$6
NOTIFICATION_TOPIC_ARN="arn:aws:sns:${AWS_REGION}:${AWS_ACCOUNT_ID}:prof_animal_lost_game"
SESSION_DB=arn:aws:dynamodb:${AWS_REGION}:${AWS_ACCOUNT_ID}:table/AnimalGenieUserSession
S3_KEY=$(s3_key_from_build ${BUILD_NUMBER})
STACK_NAME="ProfessorAnimal-${STACK_NAME}"

echo
echo "Building ${STACK_NAME}"
echo "Using:   s3://${S3_BUCKET}/${S3_KEY}"
echo

aws  cloudformation deploy \
     --template-file dist/professor-animal.cfn \
     --stack-name ${STACK_NAME} \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides \
        keyToBuildArtefact=${S3_KEY} \
        bucketName=${S3_BUCKET} \
        notificationTopicArn=${NOTIFICATION_TOPIC_ARN} \
        dataBucket=${DATA_S3_BUCKET} \
        sessionDB=${SESSION_DB} && \
    aws cloudformation describe-stacks --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs[?OutputKey==`ProfessorAnimalApi`]'