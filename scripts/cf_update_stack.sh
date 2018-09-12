#!/bin/bash
set -ex

source `dirname "$0"`/utils.sh

S3_BUCKET=$1
DATA_S3_BUCKET=$2
STACK_NAME=$3
STACK_NAME="ProfessorAnimal-${STACK_NAME}"

echo
echo "Updating ${STACK_NAME}"
echo

aws  cloudformation update-stack \
     --template-body file://./dist/professor-animal.cfn \
     --stack-name ${STACK_NAME} \
     --capabilities CAPABILITY_IAM \
     --parameters \
        ParameterKey=bucketName,ParameterValue=${S3_BUCKET} \
        ParameterKey=dataBucket,ParameterValue=${DATA_S3_BUCKET} && \
    aws cloudformation describe-stacks --stack-name ${STACK_NAME}


