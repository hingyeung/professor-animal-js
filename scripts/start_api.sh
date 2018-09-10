#!/usr/bin/env bash
set -e

EVENT=$1
CF_TEMPLATE=deployer/professor-animal.yml
ENV_VARS=app/data/env-vars.json
DOCKER_NETWORK=professoranimal_default

# use --skip-pull-image when offline
sam local start-api \
    --template ${CF_TEMPLATE} \
    --env-vars ${ENV_VARS} \
    --docker-network ${DOCKER_NETWORK} \
    --skip-pull-image