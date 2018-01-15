#!/bin/bash
set -e

DC_TEST="docker-compose -f docker-compose-test.yml"
$DC_TEST up -d db-test

# create the distribution
$DC_TEST build common-test
$DC_TEST run   common-test build

PCK_FILE=gather2.common-0.0.0-py2.py3-none-any.whl

# distribute within the containers
containers=( core odk-importer couchdb-sync ui )
for container in "${containers[@]}"
do
  cp -r ./gather2-common/dist/$PCK_FILE ./gather2-$container/conf/pip/dependencies/
done

$DC_TEST kill
