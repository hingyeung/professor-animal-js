#!/usr/bin/env python

import boto3
import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

parser = argparse.ArgumentParser()
required_named = parser.add_argument_group('required named arguments')
required_named.add_argument('--stack-name', help='name of stack to be deleted', required=True)
args = parser.parse_args()
stack_name = "ProfessorAnimal-{}".format(args.stack_name)

apigw_client = boto3.client('apigateway')
cf_client = boto3.client('cloudformation')

def getApiKeyForStack():
    apiId = filter(lambda output: output['OutputKey'] == 'ProfessorAnimalApiId',
               map(
                   lambda s_detail: s_detail['Outputs'],
                   cf_client.describe_stacks(StackName=stack_name)['Stacks'])[0])[0]['OutputValue']
    logger.info("API ID for stack {}: {}".format(stack_name, apiId))
    return apiId

def getBasePathsByApiId(apiId):
    basePathsWithMatchedApiId = []
    for domain_summary in apigw_client.get_domain_names()['items']:
        domain_name = domain_summary['domainName']
        for basePath in apigw_client.get_base_path_mappings(domainName=domain_name)['items']:
            if (basePath['restApiId'] == apiId):
                basePath['domainName'] = domain_name
                basePathsWithMatchedApiId.append(basePath)
                logger.info("Base path matching API ID {}: {}".format(apiId, basePath))
    return basePathsWithMatchedApiId

def deleteBasePaths(basePathObj):
    for basePath in basePathObj:
        logger.info("Deleting: {domainName} {basePath} {restApiId} {stage}".format(**basePath))
        apigw_client.delete_base_path_mapping(domainName=basePath['domainName'], basePath=basePath['basePath'])

def deleteStack(stackName):
    cf_client.delete_stack(StackName=stackName)

# remove all custom domain base path mapping associated with the API ID for this stack
deleteBasePaths(getBasePathsByApiId(getApiKeyForStack()))

# delete the stack
deleteStack(stack_name)