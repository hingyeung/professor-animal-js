#!/bin/bash

STACK_NAME=$1
DOMAIN_NAME=$2
BASE_PATH=$3
STAGE=$4

GET_API_ID_CMD="`dirname "$0"`/get_api_id.sh ${STACK_NAME}"
API_ID=`${GET_API_ID_CMD}`

echo
echo "Checking if base path \"${BASE_PATH}\" exists for domain name \"${DOMAIN_NAME}\""
echo
BASE_PATH_EXISTS=`aws apigateway get-base-path-mappings --domain-name ${DOMAIN_NAME} | jq -r ".items[].basePath" | grep ${BASE_PATH}`
if [ -z ${BASE_PATH_EXISTS} ]
then
    echo
    echo "Base path \"${BASE_PATH}\" does not exist under \"${DOMAIN_NAME}\". Adding \"${BASE_PATH}\"..."
    echo
    aws apigateway create-base-path-mapping \
        --domain-name ${DOMAIN_NAME} \
        --base-path ${BASE_PATH} \
        --rest-api-id ${API_ID} \
        --stage ${STAGE}
else
    echo
    echo "Updating Custom Domain Name \"${DOMAIN_NAME}\" base path mapping for \"${BASE_PATH}\" to API \"${API_ID}\" stage \"${STAGE}\""
    echo
    aws apigateway update-base-path-mapping \
        --domain-name ${DOMAIN_NAME} \
        --base-path ${BASE_PATH} \
        --patch-operations \
            op="replace",path="/restapiId",value="${API_ID}" \
            op="replace",path="/stage",value="${STAGE}"
fi
