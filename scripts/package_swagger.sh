#!/usr/bin/env bash
set -e

source `dirname "$0"`/utils.sh
TARGET_SWAGGER=dist/swagger.yml

echo "{\"build\": \"$(build_artefact_name)\"}" | npx mustache - deployer/swagger.yml.mustache > ${TARGET_SWAGGER}
