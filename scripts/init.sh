BUILD=`cat dist/BUILD`
SWAGGER_ARTEFACT=swagger-$(build_artefact_name).yml
PATH_TO_SWAGGER_ARTEFACT=dist/${SWAGGER_ARTEFACT}
S3_KEY_TO_SWAGGER=$(s3_key_for_swagger_from_build ${BUILD})
BUILD_ARTEFACT=ProfAnimalLambdaFunc-$(build_artefact_name).zip
PATH_TO_BUILD_ARTEFACT=dist/${BUILD_ARTEFACT}
S3_KEY=$(s3_key_from_build ${BUILD})
