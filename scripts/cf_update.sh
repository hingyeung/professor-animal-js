#!/bin/bash
set -ex

source `dirname "$0"`/utils.sh

S3_BUCKET=$1
NOTIFICATION_TOPIC_ARN=$2
BUILD_NUMBER=$3    # build number (e.g. "9c1a339" or "9c1a339-snapshot")
STACK_NAME=$4
S3_KEY=$(s3_key_from_build ${BUILD_NUMBER})
STACK_NAME="ProfessorAnimal-${STACK_NAME}"

echo
echo "Updating ${STACK_NAME}"
echo "Using:   s3://${S3_BUCKET}/${S3_KEY}"
echo

aws  cloudformation update-stack \
     --use-previous-template \
     --stack-name ${STACK_NAME} \
     --capabilities CAPABILITY_IAM \
     --parameters \
        ParameterKey=keyToBuildArtefact,ParameterValue=${S3_KEY} \
        ParameterKey=bucketName,ParameterValue=${S3_BUCKET} \
        ParameterKey=notificationTopicArn,ParameterValue=${NOTIFICATION_TOPIC_ARN} && \
    aws cloudformation describe-stacks --stack-name ${STACK_NAME}


