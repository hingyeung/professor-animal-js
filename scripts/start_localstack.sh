#!/bin/bash
set -e

# start localstack Docker container
SERVICES=s3,dynamodb TMPDIR=/private$TMPDIR docker-compose \
    --file deployer/localstack-docker-compose.yml \
    --project-name professor-animal \
    up
