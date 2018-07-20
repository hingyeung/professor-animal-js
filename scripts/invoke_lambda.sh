#!/bin/bash
set -e

EVENT=$1
CF_TEMPLATE=dist/professor-animal.cfn
ENV_VARS=app/data/env-vars.json
DOCKER_NETWORK=professor-animal_default

sam local invoke \
    --template ${CF_TEMPLATE} ProfessorAnimalLambdaFunction \
    --env-vars ${ENV_VARS} \
    --docker-network ${DOCKER_NETWORK} \
    -e ${EVENT}