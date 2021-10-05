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

function build_container {
    local container=$1

    echo "_____________________________________________ Building container ${container}"
    docker-compose build \
        ${BUILD_OPTIONS} \
        --build-arg GIT_REVISION=${GIT_REVISION} \
        --build-arg VERSION=${VERSION} \
        ${container}
}


function _on_exit {
    docker-compose down
}

function _on_err {
    _on_exit
    exit 1
}

trap '_on_exit' EXIT
trap '_on_err' ERR

# Generate credentials if missing
if [ -e ".env" ]; then
    echo "[.env] file already exists! Remove it if you want to generate a new one."
else
    ./scripts/generate-credentials.sh > .env
fi

set -Eeuo pipefail

# create volumes
docker volume create gather_database_data 2>/dev/null || true
docker volume create gather_minio_data    2>/dev/null || true

# pull dependencies
docker-compose pull db redis minio nginx
docker-compose pull exm kernel odk ui

if [ ! -f ./VERSION ]; then
    VERSION="0.0.0"
else
    VERSION=`cat ./VERSION`
fi
GIT_REVISION=`git rev-parse HEAD`
BUILD_OPTIONS="--no-cache --force-rm --pull"

echo "_____________________________________________"
echo "Version:     ${VERSION}"
echo "Revision:    ${GIT_REVISION}"
echo "_____________________________________________"

# build Gather assets
build_container gather-assets
docker-compose run --rm gather-assets build

# build Gather
build_container gather
