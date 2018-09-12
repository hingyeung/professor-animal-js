#!/usr/bin/env bash
set -e

S3_SRC_BUCKET=$1
S3_DATA_BUCKET=$2
STACKNAME=$3
STAGE=$4
USAGE_PLAN=$5
CUSTOM_DOMAIN_NAME=$6

# package and upload artefact
npm run clean && npm run package ${S3_SRC_BUCKET} true

# deploy stack (cf-deploy-stack script will prefix the STACKNAME with "ProfessorAnimal-"
npm run cf-deploy-stack build-artefacts.samuelli.net build-artefacts.samuelli.net ${STACKNAME}

# add api stage to usage plan
npm run add-api-stage-to-usage-plan ${USAGE_PLAN} ${STACKNAME} ${STAGE}

# map custom domain name to stage
npm run update-custom-domain-mapping ${STACKNAME} ${CUSTOM_DOMAIN_NAME} v1 ${STAGE}