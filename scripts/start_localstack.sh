#!/bin/bash
set -e

# https://github.com/localstack/localstack#running-in-docker
if [[ "$OSTYPE" == "darwin"* ]]
then
    export TMPDIR=/private$TMPDIR
fi

# Setting DATA_DIR to blank to disable persistence
export DATA_DIR=

# enable the following services
export SERVICES=s3,dynamodb,sns,cloudwatch

# start localstack Docker container
docker-compose \
    --file deployer/localstack-docker-compose.yml \
    --project-name professoranimal \
    up
