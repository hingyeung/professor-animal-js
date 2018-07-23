#!/bin/bash
set -e

USAGE_PLAN_ID=$1
STACK_NAME=$2
STAGE=$3

GET_API_ID_CMD="`dirname "$0"`/get_api_id.sh ${STACK_NAME}"
API_ID=`${GET_API_ID_CMD}`

# https://forums.aws.amazon.com/thread.jspa?threadID=238952
aws apigateway update-usage-plan \
    --usage-plan-id ${USAGE_PLAN_ID} \
    --patch-operations \
        op="add",path="/apiStages",value="${API_ID}:${STAGE}"