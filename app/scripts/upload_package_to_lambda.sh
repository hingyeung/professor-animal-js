#!/usr/bin/env bash

lambda_arn=$1
aws lambda update-function-code --zip-file fileb://./dist/lambda.zip --function-name $lambda_arn