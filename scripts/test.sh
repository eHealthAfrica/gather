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

function prepare_and_test_container {
    local container="$1-test"

    echo "_____________________________________________ Building $1"
    $DC_TEST build \
        --build-arg GIT_REVISION="${GIT_REVISION}" \
        --build-arg VERSION="${VERSION}" \
        $container
    echo "_____________________________________________ Testing $1"
    $DC_TEST run --rm "$1"-test test
    echo "_____________________________________________ $1 Done"
}

DC_TEST="docker-compose -f docker-compose-test.yml"
GIT_REVISION=rev-$(date "+%Y%m%d%H%M%S")
VERSION="t.s.t"

echo "_____________________________________________ TESTING"
echo "_____________________________________________ Version:  ${VERSION}"
echo "_____________________________________________ Revision: ${GIT_REVISION}"
echo "_____________________________________________"

echo "_____________________________________________ Killing ALL containers"
docker-compose kill
$DC_TEST kill
$DC_TEST down -v
$DC_TEST pull db-test

prepare_and_test_container gather-assets
$DC_TEST run --rm gather-assets-test build

echo "_____________________________________________ Starting database"
$DC_TEST up -d db-test

prepare_and_test_container gather

echo "_____________________________________________ Killing TEST containers"
$DC_TEST kill
$DC_TEST down -v

echo "_____________________________________________ END"
