#!/usr/bin/env bash
set -e

S3_SRC_BUCKET=$1
S3_DATA_BUCKET=$2
STACKNAME=$3
STAGE=$4
USAGE_PLAN=$5
CUSTOM_DOMAIN_NAME=$6

# deploy stack
npm run clean && npm run package ${S3_SRC_BUCKET}
BUILD=`npm run upload-to-s3 ${S3_SRC_BUCKET} | grep ' uploaded.$' | sed  -E 's/Build (.+) uploaded\./\1/'`
npm run cf-deploy-stack ${BUILD}  ${S3_SRC_BUCKET} ${S3_DATA_BUCKET} ${STACKNAME}

# add api stage to usage plan
npm run add-api-stage-to-usage-plan ${USAGE_PLAN} ${STACKNAME} ${STAGE}

# map custom domain name to stage
npm run update-custom-domain-mapping ${STACKNAME} ${CUSTOM_DOMAIN_NAME} v1 ${STAGE}