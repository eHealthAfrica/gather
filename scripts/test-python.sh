#!/usr/bin/env bash
#
# Copyright (C) 2023 by eHealth Africa : http://www.eHealthAfrica.org
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

function prepare_db {
    psql -U postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
    psql -U postgres -c "DROP ROLE IF EXISTS ${PGUSER};"

    echo "***** CREATING ${PGUSER} ROLE *****"
    psql -U postgres -c "CREATE ROLE ${PGUSER} WITH LOGIN PASSWORD '${PGPASSWORD}' CREATEDB;"

    echo "***** CREATING ${DB_NAME} DATABASE *****"
    psql -U postgres -c "CREATE DATABASE ${DB_NAME} WITH OWNER ${PGUSER};"
}

function install_deps {
    local VIRTUAL_ENV="./venv"

    rm -rf ${VIRTUAL_ENV}
    mkdir -p ${VIRTUAL_ENV}

    python3 -m venv ${VIRTUAL_ENV}

    source ${VIRTUAL_ENV}/bin/activate

    pip3 install -q -r ./app/conf/pip/requirements.txt
}

prepare_db
install_deps

# move to app
cd app

# run tests
./entrypoint.sh test_lint
./entrypoint.sh test_py
