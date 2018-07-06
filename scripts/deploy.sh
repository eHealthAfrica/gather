#!/usr/bin/env bash
#
# Copyright (C) 2018 by eHealth Africa : http://www.eHealthAfrica.org
#
# See the NOTICE file distributed with this work for additional information
# regarding copyright ownership.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
set -e

export AWS_DEFAULT_REGION="eu-west-1"
export BRANCH="${TRAVIS_BRANCH}"
export DOCKER_REPO="387526361725.dkr.ecr.eu-west-1.amazonaws.com"
export APP="gather"

$(aws ecr get-login --no-include-email)

if [[ -n $TRAVIS_TAG ]]; then
  DOCKER_TAG=`cat ../VERSION`
else
  DOCKER_TAG=$TRAVIS_BRANCH
fi

# Build and distribute the JS assets
docker-compose build gather-assets
docker-compose run   gather-assets build

# Build and push docker
docker-compose build $APP
docker tag $APP ${DOCKER_REPO}/${APP}:${DOCKER_TAG}
docker push ${DOCKER_REPO}/${APP}:${DOCKER_TAG}

# # Publish Helm package
# docker run -a STDOUT -a STDERR \
#  -e BRANCH=$TRAVIS_BRANCH -e RELEASE=$RELEASE \
#  -e AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
#  -e APP=$APP \
#  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
#  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
#  ehealthafrica/deployer \
#  publish_helm
