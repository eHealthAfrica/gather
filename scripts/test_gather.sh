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

function prepare_container() {
  container="$1"-test

  echo "_____________________________________________ Preparing $1"
  $DC_TEST build $container
  $DC_TEST run $container setuplocaldb
}

function prepare_and_test_container() {
  container="$1"-test

  echo "_____________________________________________ Starting $1 tasks"
  prepare_container $1
  $DC_TEST run $container test --noinput
  echo "_____________________________________________ $1 tasks done"
}

DC_TEST="docker-compose -f docker-compose-test.yml"

echo "_____________________________________________ TESTING"

# kill ALL containers and clean TEST ones
echo "_____________________________________________ Killing ALL containers"
docker-compose kill
$DC_TEST kill
$DC_TEST down

# start database
echo "_____________________________________________ Starting databases"
$DC_TEST up -d db-test

echo "_____________________________________________ Preparing kernel and odk"
prepare_container kernel
prepare_container odk

echo "_____________________________________________ Starting kernel and odk"
$DC_TEST up -d kernel-test odk-test

# test a clean Gather TEST container
prepare_and_test_container gather

# kill ALL containers
echo "_____________________________________________ Killing TEST containers"
$DC_TEST kill

echo "_____________________________________________ END"
