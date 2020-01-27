#!/usr/bin/env bash
#
# Copyright (C) 2019 by eHealth Africa : http://www.eHealthAfrica.org
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
set -Eeuo pipefail

function build_container {
    local container=$1
    local BUILD_OPTIONS="--no-cache --force-rm --pull"

    docker-compose build \
        ${BUILD_OPTIONS} \
        --build-arg GIT_REVISION=${TRAVIS_COMMIT} \
        --build-arg VERSION=${VERSION} \
        ${container}
}

# release version depending on TRAVIS_BRANCH (develop | release-#.#) / TRAVIS_TAG (#.#.#)
if [[ ${TRAVIS_TAG} =~ ^[0-9]+(\.[0-9]+){2}$ ]]; then
    VERSION=${TRAVIS_TAG}

elif [[ ${TRAVIS_BRANCH} =~ ^release\-[0-9]+\.[0-9]+$ ]]; then
    VERSION=`cat VERSION`
    # append "-rc" suffix
    VERSION="${VERSION}-rc"

else
    VERSION="alpha"
fi

echo "--------------------------------------------------------------"
echo "Releasing in branch: ${TRAVIS_BRANCH}"
echo "Release version:     ${VERSION}"
echo "Release revision:    ${TRAVIS_COMMIT}"
echo "--------------------------------------------------------------"

APP="gather"
DOCKER_IMAGE="ehealthafrica/${APP}:${VERSION}"

# Build and distribute the JS assets
build_container gather-assets
docker-compose run --rm gather-assets build

# Build and push docker image to docker hub
build_container ${APP}

# Login in docker hub
docker login -u ${DOCKER_HUB_USER} -p ${DOCKER_HUB_PASSWORD}

echo "Pushing Docker image ${DOCKER_IMAGE}"
docker tag ${APP} ${DOCKER_IMAGE}
docker push ${DOCKER_IMAGE}

docker logout
