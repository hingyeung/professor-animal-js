#!/bin/bash
set -e

BUCKET=$1

aws cloudformation package \
     --template-file deployer/professor-animal.yml \
     --s3-bucket ${BUCKET} \
     --s3-prefix professor-animal/src \
     --output-template-file dist/professor-animal.cfn
