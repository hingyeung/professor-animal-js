#!/bin/bash
set -e

source `dirname "$0"`/utils.sh

DATA_S3_BUCKET=$1
STACK_NAME=$2
STACK_NAME="ProfessorAnimal-${STACK_NAME}"

echo
echo "Building ${STACK_NAME}"
echo

aws  cloudformation deploy \
     --template-file dist/professor-animal.cfn \
     --stack-name ${STACK_NAME} \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides \
        dataBucket=${DATA_S3_BUCKET} && \
    aws cloudformation describe-stacks --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs'