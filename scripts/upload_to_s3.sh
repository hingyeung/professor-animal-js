#!/bin/bash
set -e

source `dirname "$0"`/utils.sh
source `dirname "$0"`/init.sh

S3_BUCKET=$1

#BUILD=`cat dist/BUILD`
#BUILD_ARTEFACT=ProfAnimalLambdaFunc-${BUILD}.zip
#PATH_TO_BUILD_ARTEFACT=dist/${BUILD_ARTEFACT}
#S3_KEY=$(s3_key_from_build ${BUILD})

function get_checksum_for_object() {
    local bucket=$1
    local build_artefact=$2

    aws s3api head-object --bucket ${bucket} --key ${S3_KEY} 2>/dev/null | jq -r '.Metadata.md5chksum'
}

if [ -L dist/CURRENT_SWAGGER ] && [ -e ${PATH_TO_SWAGGER_ARTEFACT} ]
then
    aws s3api put-object \
        --bucket ${S3_BUCKET} \
        --key ${S3_KEY_TO_SWAGGER} \
        --body ${PATH_TO_SWAGGER_ARTEFACT}
else
    echo "dist/CURRENT_SWAGGER does not exist or not pointing to a valid file."
    exit 1
fi

if [ -L dist/CURRENT_BUILD ] && [ -e ${PATH_TO_BUILD_ARTEFACT} ]
then
    echo "Preparing to upload"
    echo "==================="
    echo "From: ${PATH_TO_BUILD_ARTEFACT}"
    echo "To:   s3://${S3_BUCKET}/${S3_KEY}"
    echo

    # check if this object already exist on s3 with identical checksum
    chksum_for_new_artefact=`openssl md5 -binary ${PATH_TO_BUILD_ARTEFACT} | base64`
    chksum_for_existing_artefact=$(get_checksum_for_object ${S3_BUCKET} ${PATH_TO_BUILD_ARTEFACT})
    echo "Checksum"
    echo "========"
    echo "Existing: ${chksum_for_existing_artefact}"
    echo "New:      ${chksum_for_new_artefact}"
    echo

    if [ "${chksum_for_existing_artefact}" != "${chksum_for_new_artefact}" ]
    then
        aws s3api put-object \
                --bucket ${S3_BUCKET} \
                --key ${S3_KEY} \
                --body ${PATH_TO_BUILD_ARTEFACT} \
                --metadata md5chksum=${chksum_for_new_artefact} \
                --content-md5 ${chksum_for_new_artefact}

        echo "Build ${BUILD} uploaded."
        echo
    else
        echo "${BUILD_ARTEFACT} with identical checksum already exists. SKipping."
    fi
else
    echo "dist/CURRENT_BUILD does not exist or not pointing to a valid file."
    exit 1
fi