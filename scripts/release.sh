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

function docker_push {
    local TAG=$1
    local IMAGE_REPO=$2
    local IMAGE=${IMAGE_REPO}/${APP}:${TAG}
    local IMAGE_SHA=${IMAGE_REPO}/${APP}:${TRAVIS_COMMIT}
    local PUSH_SHA=$3

    echo "Pushing Docker image ${IMAGE}"
    docker tag ${APP} ${IMAGE}
    docker push ${IMAGE}

    if [[ $PUSH_SHA == 'true' ]]; then
        echo "Pushing Docker image ${IMAGE_SHA}"
        docker tag ${APP} ${IMAGE_SHA}
        docker push ${IMAGE_SHA}
    fi
}

if [[ "${TRAVIS_PULL_REQUEST}" != "false" ]]; then
    echo "--------------------------------------------------------------"
    echo "Skipping a release because this is a pull request: ${TRAVIS_PULL_REQUEST}"
    echo "--------------------------------------------------------------"
    exit 0
fi

# release version depending on TRAVIS_BRANCH (develop | release-#.#) / TRAVIS_TAG (#.#.#)
if [[ ${TRAVIS_TAG} =~ ^[0-9]+(\.[0-9]+){2}$ ]]; then
    VERSION=${TRAVIS_TAG}

elif [[ ${TRAVIS_BRANCH} =~ ^release\-[0-9]+\.[0-9]+$ ]]; then
    VERSION=`cat VERSION`
    # append "-rc" suffix
    VERSION=${VERSION}-rc

elif [[ ${TRAVIS_BRANCH} = "develop" ]]; then
    VERSION="alpha"

else
    echo "--------------------------------------------------------------"
    echo "Skipping a release because this branch is not permitted: ${TRAVIS_BRANCH}"
    echo "--------------------------------------------------------------"
    exit 0
fi

echo "--------------------------------------------------------------"
echo "Releasing in branch: ${TRAVIS_BRANCH}"
echo "Release version:     ${VERSION}"
echo "Release revision:    ${TRAVIS_COMMIT}"
echo "--------------------------------------------------------------"

APP="gather"

# Build and distribute the JS assets
build_container gather-assets
docker-compose run --rm gather-assets build

# Build and push docker image to docker hub
build_container ${APP}

if [[ ${VERSION} = "alpha" ]]; then
    # ===========================================================
    # push images to deployment repository

    GCR_REPO_URL="https://eu.gcr.io"
    IMAGE_REPO="eu.gcr.io/development-223016"

    openssl aes-256-cbc -K $encrypted_422343ef1cd5_key -iv $encrypted_422343ef1cd5_iv -in gcs_key.json.enc -out gcs_key.json -d
    docker login -u _json_key -p "$(cat gcs_key.json)" $GCR_REPO_URL
    docker_push ${VERSION} ${IMAGE_REPO} true

    export GOOGLE_APPLICATION_CREDENTIALS=gcs_key.json
    push-app-version --project gather-alpha --version $TRAVIS_COMMIT
    docker logout

    # Login in docker hub
    docker login -u ${DOCKER_HUB_USER} -p ${DOCKER_HUB_PASSWORD}
    docker_push ${VERSION} ehealthafrica false
else
    # Login in docker hub
    docker login -u ${DOCKER_HUB_USER} -p ${DOCKER_HUB_PASSWORD}

    docker_push ${VERSION} ehealthafrica
    if [ -z "$TRAVIS_TAG" ]; then
        docker_push "${VERSION}--${TRAVIS_COMMIT}" ehealthafrica false
    fi
fi

docker logout
