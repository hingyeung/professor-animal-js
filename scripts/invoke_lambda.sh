#!/bin/bash
set -e

EVENT=$1
CF_TEMPLATE=dist/professor-animal.cfn
ENV_VARS=app/data/env-vars.json
DOCKER_NETWORK=professoranimal_default

# use --skip-pull-image when offline
sam local invoke \
    --template ${CF_TEMPLATE} ProfessorAnimalLambdaFunction \
    --env-vars ${ENV_VARS} \
    --docker-network ${DOCKER_NETWORK} \
    --skip-pull-image \
    -e ${EVENT}