#!/bin/bash
set -e

source `dirname "$0"`/utils.sh

S3_BUCKET=$1
NOTIFICATION_TOPIC_ARN=$2
BUILD_NUMBER=$3    # build number (e.g. "9c1a339" or "9c1a339-snapshot")
S3_KEY=$(s3_key_from_build ${BUILD_NUMBER})
STACK_NAME="ProfessorAnimal-${BUILD_NUMBER}"

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
        notificationTopicArn=${NOTIFICATION_TOPIC_ARN} && \
    aws cloudformation describe-stacks --stack-name ${STACK_NAME}