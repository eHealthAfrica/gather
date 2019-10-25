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
    $DC build \
        ${BUILD_OPTIONS} \
        --build-arg GIT_REVISION=${GIT_REVISION} \
        --build-arg VERSION=${VERSION} \
        ${container}
}

# Generate credentials if missing
if [ -e ".env" ]; then
    echo "[.env] file already exists! Remove it if you want to generate a new one."
else
    ./scripts/generate-credentials.sh > .env
fi

set -Eeuo pipefail

DC="docker-compose -f docker-compose-local.yml"

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

# build assets containers
containers=( ui gather )
for container in "${containers[@]}"; do
    build_container ${container}-assets
    $DC run --rm ${container}-assets build
done

# build containers
containers=( kernel ui odk gather )
for container in "${containers[@]}"; do
    build_container ${container}
done
