#!/bin/bash
set -e

STACK_NAME=ProfessorAnimal-$1

echo
echo "You are about to delete Professor Animal stack ${STACK_NAME}."
read -p "ARE YOU SURE? " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]
then
    aws cloudformation delete-stack --stack-name  ${STACK_NAME}
fi