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
    pip install virtualenv
    rm -rf /tmp/env

    virtualenv -p python3 /tmp/env/
    /tmp/env/bin/pip install -q \
        -f ./conf/pip/dependencies \
        -r ./conf/pip/primary-requirements.txt \
        --upgrade

    cat conf/pip/requirements_header.txt | tee conf/pip/requirements.txt
    /tmp/env/bin/pip freeze --local | grep -v appdir | tee -a conf/pip/requirements.txt
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

    # create admin user
    # arguments:
    #    -u=admin
    #    -p=secretsecret
    #    -e=admin@gather2.org
    #    -t=01234656789abcdefghij
    python ./manage.py setup_admin -u=$ADMIN_USERNAME -p=$ADMIN_PASSWORD

    # copy assets bundles folder into static folder
    rm -r -f ./gather/static/*.*
    cp -r ./gather/assets/bundles/* ./gather/static/

    # copy static files to "/var/www/static" to be served by nginx (even in DEBUG mode)
    STATIC_ROOT=/var/www/static

    # create static assets
    python ./manage.py collectstatic --noinput --clear --verbosity 0

    # expose version number (if exists)
    cp /var/tmp/VERSION $STATIC_ROOT/VERSION   2>/dev/null || :
    # add git revision (if exists)
    cp /var/tmp/REVISION $STATIC_ROOT/REVISION 2>/dev/null || :

    chmod -R 755 $STATIC_ROOT
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
    flake8 . --config=./conf/extras/flake8.cfg
}

function test_coverage {
    RCFILE=/code/conf/extras/coverage.rc
    PARALLEL_COV="--concurrency=multiprocessing --parallel-mode"
    PARALLEL_PY="--parallel=${TEST_PARALLEL:-4}"

    rm -R /code/.coverage* 2>/dev/null || :
    coverage run     --rcfile="$RCFILE" $PARALLEL_COV manage.py test --noinput "${@:1}" $PARALLEL_PY
    coverage combine --rcfile="$RCFILE" --append
    coverage report  --rcfile="$RCFILE"
    coverage erase

    cat /code/conf/extras/good_job.txt
}

BACKUPS_FOLDER=/backups

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
        setup
        [ -z "${DEBUG:-}" ] && UWSGI_LOGGING="--disable-logging" || UWSGI_LOGGING=""

        UWSGI_STATIC="--static-map ${APP_URL:-/}static=/var/www/static"
        UWSGI_FAVICO="--static-map ${APP_URL:-/}favicon.ico=/var/www/static/images/gather.ico"
        [ -z "${UWSGI_SERVE_STATIC:-}" ] && UWSGI_STATIC="" && UWSGI_FAVICO=""

        export DEBUG=''
        /usr/local/bin/uwsgi \
            --ini /code/conf/uwsgi.ini \
            --http 0.0.0.0:${WEB_SERVER_PORT} \
            --processes ${UWSGI_PROCESSES:-4} \
            --threads ${UWSGI_THREADS:-2} \
            ${UWSGI_STATIC} \
            ${UWSGI_FAVICO} \
            ${UWSGI_LOGGING}
    ;;

    start_dev )
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

        if [[ "$AETHER_MODULES" == *odk* ]];
        then
            python ./manage.py check_url \
                --url=$AETHER_ODK_URL \
                --token=$AETHER_ODK_TOKEN
        else
            echo "No ODK module enabled!"
        fi

        if [[ "$AETHER_MODULES" == *couchdb-sync* ]];
        then
            python ./manage.py check_url \
                --url=$AETHER_COUCHDB_SYNC_URL \
                --token=$AETHER_COUCHDB_SYNC_TOKEN
        else
            echo "No CouchDB-Sync module enabled!"
        fi
    ;;

    test )
        export TESTING=true
        setup
        test_lint
        test_coverage
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
