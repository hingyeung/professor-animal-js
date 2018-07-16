#!/bin/bash

source scripts/utils.sh

pushd .

mkdir dist && \
    build_artefact_name > dist/BUILD &&
    cp -r app/* dist/ && \
    cp -R node_modules dist/ && \
    cd dist && \
    zip -r ProfAnimalLambdaFunc-$(build_artefact_name).zip *

popd