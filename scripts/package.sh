#!/bin/bash
set -e
S3_BUCKET=$1
UPLOAD_TO_S3=$2

source scripts/utils.sh
BUILD_NAME=$(build_artefact_name)

# validate SAM template
#sam validate --template deployer/professor-animal.yml

# build artefact
pushd .
BUILD_ARTEFACT=ProfAnimalLambdaFunc-${BUILD_NAME}.zip
mkdir -p dist && \
    echo -n ${BUILD_NAME} > dist/BUILD &&
    cp -r app/* dist/ && \
    cp -R node_modules dist/ && \
    cd dist && \
#    zip -Xqr ${BUILD_ARTEFACT} * && \
#    ln -s ${BUILD_ARTEFACT} CURRENT_BUILD
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

echo
echo ===
echo BUILD ${BUILD_NAME} packaged: ProfAnimalLambdaFunc-${BUILD_NAME}.zip
echo