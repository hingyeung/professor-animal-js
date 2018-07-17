#!/bin/bash
set -e

source `dirname "$0"`/utils.sh

S3_BUCKET=$1
TARGET_SWAGGER_YML=dist/swagger-$(build_artefact_name).yml
TARGET_SAM_YML=dist/professor-animal-$(build_artefact_name).yml
VIEW_DATA="{\"build\": \"$(build_artefact_name)\"}"

pushd .

mkdir -p dist && \
    build_artefact_name > dist/BUILD &&
    source `dirname "$0"`/init.sh &&    # must be done after dist/BUILD is created
    cp -r app/* dist/ && \
    cp -R node_modules dist/ && \
    echo ${VIEW_DATA} | npx mustache - deployer/swagger.yml.mustache > ${TARGET_SWAGGER_YML} && \
    echo ${VIEW_DATA} | npx mustache - deployer/professor-animal.yml.mustache > ${TARGET_SAM_YML} && \
    cd dist && \
    zip -r ${BUILD_ARTEFACT} * && \
    rm CURRENT_BUILD && ln -s ${BUILD_ARTEFACT} CURRENT_BUILD && \
    rm CURRENT_SWAGGER && ln -s ${SWAGGER_ARTEFACT} CURRENT_SWAGGER

popd
aws cloudformation package \
     --template-file ${TARGET_SAM_YML} \
     --s3-bucket UNUSED \
     --output-template-file dist/professor-animal.cfn
