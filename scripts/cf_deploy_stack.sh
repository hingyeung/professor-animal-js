#!/bin/bash
set -e

source `dirname "$0"`/utils.sh

S3_BUCKET=$1
DATA_S3_BUCKET=$2
STACK_NAME=$3
STACK_NAME="ProfessorAnimal-${STACK_NAME}"

CURRENT_GIT_BRANCH=`git rev-parse --abbrev-ref HEAD`

echo
echo "Building ${STACK_NAME}"
echo

aws  cloudformation deploy \
     --template-file dist/professor-animal.cfn \
     --stack-name ${STACK_NAME} \
     --capabilities CAPABILITY_IAM \
     --parameter-overrides \
        artefactBucket=${S3_BUCKET} \
        gitBranch=${CURRENT_GIT_BRANCH} \
        dataBucket=${DATA_S3_BUCKET} && \
    aws cloudformation describe-stacks --stack-name ${STACK_NAME} \
        --query 'Stacks[0].Outputs'