#!/bin/bash
set -e

S3_BUCKET=test-data
SESSION_TABLE=AnimalGenieUserSession

# Seed initial data into DynamoDB and S3 hosted by localstack. By default
# data is stored in memory and needs to be re-seed after localstack container restart.

# Create table in DynamoDB hosted inside localstack
# Make sure localstack is running with DynamoDB service enabled
echo
echo Creating table ${SESSION_TABLE}
echo
aws dynamodb create-table \
    --endpoint-url http://localhost:4569 \
    --table-name ${SESSION_TABLE} \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1

# Store animal definition file in S3
# Make sure localstack is running with S3 service enabled
echo
echo Creating S3 bucket ${S3_BUCKET}
echo
aws --endpoint-url=http://localhost:4572 --region=ap-southeast-2 s3 mb s3://${S3_BUCKET}
aws --endpoint-url=http://localhost:4572 --region=ap-southeast-2 s3 cp app/data/animals.json s3://test-data/