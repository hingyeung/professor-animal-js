#!/bin/bash

BUCKET_NAME=$1
NOTIFICATION_TOPIC_ARN=$2
STACK_NAME=$3

aws  cloudformation deploy \
     --template-file dist/professor-animal.cfn \
     --stack-name ${STACK_NAME} \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides \
        bucketName=${BUCKET_NAME} \
        notificationTopicArn=${NOTIFICATION_TOPIC_ARN} && \
aws cloudformation describe-stacks --stack-name ${STACK_NAME}