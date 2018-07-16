#!/bin/sh

BUILD_ARTEFACT=$1
BUCKET=$2

aws s3 cp ${BUILD_ARTEFACT} s3://${BUCKET}/professor-animal/src/