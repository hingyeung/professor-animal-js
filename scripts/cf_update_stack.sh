#!/bin/bash
set -ex

source `dirname "$0"`/utils.sh

BUILD_NUMBER=$1    # build number (e.g. "9c1a339" or "9c1a339-snapshot")
S3_BUCKET=$2
DATA_S3_BUCKET=$3
STACK_NAME=$4
S3_KEY=$(s3_key_from_build ${BUILD_NUMBER})
STACK_NAME="ProfessorAnimal-${STACK_NAME}"

echo
echo "Updating ${STACK_NAME}"
echo "Using:   s3://${S3_BUCKET}/${S3_KEY}"
echo

aws  cloudformation update-stack \
     --no-use-previous-template \
     --template-body file://./dist/professor-animal.cfn \
     --stack-name ${STACK_NAME} \
     --capabilities CAPABILITY_IAM \
     --parameters \
        ParameterKey=keyToBuildArtefact,ParameterValue=${S3_KEY} \
        ParameterKey=bucketName,ParameterValue=${S3_BUCKET} \
        ParameterKey=dataBucket,ParameterValue=${DATA_S3_BUCKET} && \
    aws cloudformation describe-stacks --stack-name ${STACK_NAME}


