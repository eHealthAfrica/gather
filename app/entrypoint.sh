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

function show_help {
    echo """
    Commands
    ----------------------------------------------------------------------------

    bash               : run bash
    eval               : eval shell command
    manage             : invoke django manage.py commands

    pip_freeze         : freeze pip dependencies and write to 'requirements.txt'

    setup              : check required environment variables,
                         create/migrate database and,
                         create/update superuser using
                            'ADMIN_USERNAME' and 'ADMIN_PASSWORD'

    backup_db          : creates db dump (${BACKUPS_FOLDER}/${DB_NAME}-backup-{timestamp}.sql)
    restore_dump       : restore db dump (${BACKUPS_FOLDER}/${DB_NAME}-backup.sql)

    start              : start webserver behind nginx
    start_dev          : start webserver for development

    health             : checks the system healthy
    check_aether       : checks communication with Aether apps

    test               : run tests
    test_lint          : run flake8 tests
    test_coverage      : run python tests with coverage output
    test_py            : alias of test_coverage

    """
}

function pip_freeze {
    local VENV=/tmp/env
    rm -rf ${VENV}
    mkdir -p ${VENV}
    python3 -m venv ${VENV}

    ${VENV}/bin/pip install -q \
        -r ./conf/pip/primary-requirements.txt \
        --upgrade

    cat conf/pip/requirements_header.txt | tee conf/pip/requirements.txt
    ${VENV}/bin/pip freeze --local | grep -v appdir | tee -a conf/pip/requirements.txt
}

function setup {
    # check if required environment variables exist
    ./conf/check_vars.sh

    # check database
    pg_isready

    if psql -c "" $DB_NAME; then
        echo "$DB_NAME database exists!"
    else
        createdb -e $DB_NAME -e ENCODING=UTF8
        echo "$DB_NAME database created!"
    fi

    # migrate data model if needed
    python ./manage.py migrate --noinput

    # clean out expired sessions
    python ./manage.py clearsessions

    # create admin user
    # arguments:
    #    -u=admin
    #    -p=secretsecret
    #    -e=admin@gather2.org
    #    -t=01234656789abcdefghij
    python ./manage.py setup_admin -u=$ADMIN_USERNAME -p=$ADMIN_PASSWORD -t=${ADMIN_TOKEN:-}

    # create static assets
    echo "Collecting static files..."

    STATIC_ROOT=${STATIC_ROOT:-/var/www/static}
    mkdir -p $STATIC_ROOT

    # cleaning local
    local STATIC_DIR="./gather/static"
    rm -r -f ${STATIC_DIR}/*.*
    rm -r -f ${STATIC_DIR}/VERSION
    rm -r -f ${STATIC_DIR}/REVISION

    # expose version number (if exists)
    cp /var/tmp/VERSION ${STATIC_DIR}/VERSION   2>/dev/null || true
    # add git revision (if exists)
    cp /var/tmp/REVISION ${STATIC_DIR}/REVISION 2>/dev/null || true

    # copy assets bundles folder into static folder
    local WEBPACK_FILES="./gather/assets/bundles"
    if [ ${COLLECT_STATIC_FILES_ON_STORAGE:-} ]; then
        local CDN_FULL_URL="${CDN_URL:-}"
        if [ ${COLLECT_STATIC_FILES_VERSIONED:-} ]; then
            local APP_VERSION=`cat /var/tmp/VERSION`
            CDN_FULL_URL="${CDN_URL:-}/${APP_VERSION}"
        else
            local APP_VERSION=""
        fi

        ./manage.py cdn_publish \
            -u="${CDN_FULL_URL}" \
            -w=$WEBPACK_FILES \
            -s="${APP_VERSION}/"
    fi
    cp -r ${WEBPACK_FILES}/* $STATIC_DIR

    ./manage.py collectstatic --noinput --verbosity 0
    chmod -R 755 ${STATIC_ROOT}
}

function backup_db {
    pg_isready

    if psql -c "" $DB_NAME; then
        echo "$DB_NAME database exists!"

        pg_dump $DB_NAME > ${BACKUPS_FOLDER}/${DB_NAME}-backup-$(date "+%Y%m%d%H%M%S").sql
        echo "$DB_NAME database backup created."
    fi
}

function restore_db {
    pg_isready

    # backup current data
    backup_db

    # delete DB is exists
    if psql -c "" $DB_NAME; then
        dropdb -e $DB_NAME
        echo "$DB_NAME database deleted."
    fi

    createdb -e $DB_NAME -e ENCODING=UTF8
    echo "$DB_NAME database created."

    # load dump
    psql -e $DB_NAME < ${BACKUPS_FOLDER}/${DB_NAME}-backup.sql
    echo "$DB_NAME database dump restored."

    # migrate data model if needed
    ./manage.py migrate --noinput
}

function test_lint {
    flake8
}

function test_coverage {
    coverage erase || true

    coverage run \
        --concurrency=multiprocessing \
        --parallel-mode \
        manage.py test \
        --parallel ${TEST_PARALLEL:-} \
        --noinput \
        "${@:1}"
    coverage combine --append
    coverage report
    coverage erase

    cat ./conf/extras/good_job.txt
}

BACKUPS_FOLDER=/backups

export APP_MODULE=gather
export DJANGO_SETTINGS_MODULE="${APP_MODULE}.settings"

export WEBPACK_REQUIRED=true

case "$1" in
    bash )
        bash
    ;;

    eval )
        eval "${@:2}"
    ;;

    manage )
        python ./manage.py "${@:2}"
    ;;

    pip_freeze )
        pip_freeze
    ;;

    setup )
        setup
    ;;

    backup_db )
        backup_db
    ;;

    restore_dump )
        restore_db
    ;;

    start )
        # ensure that DEBUG mode is disabled
        export DEBUG=

        setup

        # Export workaround: in seconds: 20min
        export UWSGI_HARAKIRI=${UWSGI_HARAKIRI:-1200}

        ./conf/uwsgi/start.sh
    ;;

    start_dev )
        # ensure that DEBUG mode is enabled
        export DEBUG=true

        setup

        python ./manage.py runserver 0.0.0.0:$WEB_SERVER_PORT
    ;;

    health )
        python ./manage.py check_url \
            --url=http://0.0.0.0:$WEB_SERVER_PORT/health
    ;;

    check_aether )
        python ./manage.py check_url \
            --url=$AETHER_KERNEL_URL \
            --token=$AETHER_KERNEL_TOKEN

        if [[ "$EXTERNAL_APPS" == *odk* ]];
        then
            python ./manage.py check_url \
                --url=$AETHER_ODK_URL \
                --token=$AETHER_ODK_TOKEN
        else
            echo "No ODK module enabled!"
        fi
    ;;

    test )
        export TESTING=true

        setup
        test_lint
        test_coverage "${@:2}"
    ;;

    test_lint )
        export TESTING=true

        test_lint
    ;;

    test_coverage | test_py )
        export TESTING=true

        test_coverage "${@:2}"
    ;;

    * )
        show_help
    ;;
esac
