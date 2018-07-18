#!/bin/bash
set -e

source scripts/utils.sh

pushd .

BUILD_ARTEFACT=ProfAnimalLambdaFunc-$(build_artefact_name).zip
mkdir dist && \
    build_artefact_name > dist/BUILD &&
    cp -r app/* dist/ && \
    cp -R node_modules dist/ && \
    cd dist && \
    zip -r ${BUILD_ARTEFACT} * && \
    ln -s ${BUILD_ARTEFACT} CURRENT_BUILD

popd