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

APP="gather"
DOCKER_REPO="ehealthafrica"

if [[ -n $TRAVIS_TAG ]]; then
    DOCKER_TAG=$TRAVIS_TAG
else
    DOCKER_TAG=$TRAVIS_BRANCH
fi

DOCKER_IMAGE=${DOCKER_REPO}/${APP}:${DOCKER_TAG}

# Login in docker hub
docker login -u $DOCKER_HUB_USER -p $DOCKER_HUB_PASSWORD

# Build and distribute the JS assets
docker-compose build gather-assets
docker-compose run   gather-assets build

# Build and push docker image to docker hub
docker-compose build \
    --build-arg GIT_REVISION=$TRAVIS_COMMIT \
    --build-arg VERSION=$DOCKER_TAG \
    $APP

docker tag  $APP ${DOCKER_IMAGE}
docker push      ${DOCKER_IMAGE}
