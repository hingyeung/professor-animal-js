#!/bin/bash
set -e
S3_BUCKET=$1
UPLOAD_TO_S3=$2

# validate SAM template
#sam validate --template deployer/professor-animal.yml

# build artefact
pushd .
mkdir -p dist && \
    rsync -avzh app/ dist/ && \
    rsync -zvzh package.json dist/ && \
    rsync -zvzh package-lock.json dist/
#    rsync -avzh node_modules dist/
pushd dist/ && npm i --production && popd
popd

# build CloudFormation template
if [ "${UPLOAD_TO_S3}" == "true" ]
then
    aws cloudformation package \
         --template-file deployer/professor-animal.yml \
         --s3-bucket ${S3_BUCKET} \
         --s3-prefix professor-animal/artefacts \
         --output-template-file dist/professor-animal.cfn
fi
