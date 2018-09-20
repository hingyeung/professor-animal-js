#!/usr/bin/env bash
set -e

EVENT=$1
CF_TEMPLATE=deployer/professor-animal.yml
ENV_VARS=app/data/env-vars.json
DOCKER_NETWORK=professoranimal_default

DEBUG_CONNFIG=""
if [ "${DEBUG_API}" = "true" ]
then
    DEBUG_CONNFIG=" -d 5858 "
fi

# use --skip-pull-image when offline
sam local start-api \
    --template ${CF_TEMPLATE} \
    --env-vars ${ENV_VARS} \
    --docker-network ${DOCKER_NETWORK} \
    --skip-pull-image \
    ${DEBUG_CONNFIG}