#!/bin/bash

source scripts/utils.sh

BUCKET_NAME=$1
NOTIFICATION_TOPIC_ARN=$2
BUILD_ARTEFACT=$3
STACK_NAME=`echo ${BUILD_ARTEFACT} | sed 's/\.zip$//'`
aws  cloudformation deploy \
     --template-file dist/professor-animal.cfn \
     --stack-name ${STACK_NAME} \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides \
        keyToBuildArtefact=${BUILD_ARTEFACT} \
        bucketName=${BUCKET_NAME} \
        notificationTopicArn=${NOTIFICATION_TOPIC_ARN} && \
aws cloudformation describe-stacks --stack-name ${STACK_NAME}