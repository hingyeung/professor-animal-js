#!/bin/bash

pushd .

mkdir dist && \
    git log -1 --pretty=format:"%h" > dist/BUILD &&
    cp -r app/* dist/ && \
    cp -R node_modules dist/ && \
    git log --format='%h' -1 > dist/BUILD && \
    cd dist && \
    zip -r lambda.zip *

popd