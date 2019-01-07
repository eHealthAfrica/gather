#!/bin/bash
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


# Define help message
show_help () {
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

    start              : start webserver behind nginx
    start_dev          : start webserver for development

    health             : checks the system healthy
    check_kernel       : checks communication with Aether Kernel
    check_odk          : checks communication with Aether ODK
    check_couchdb_sync : checks communication with Aether CouchDB Sync

    test               : run tests
    test_lint          : run flake8 tests
    test_coverage      : run python tests with coverage output
    test_py            : alias of test_coverage

    """
}

pip_freeze () {
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

setup () {
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
    cp ./VERSION $STATIC_ROOT/VERSION   2>/dev/null || :
    # add git revision (if exists)
    cp ./REVISION $STATIC_ROOT/REVISION 2>/dev/null || :

    chmod -R 755 $STATIC_ROOT
}

test_lint () {
    flake8 . --config=./conf/extras/flake8.cfg
}

test_coverage () {
    export RCFILE=./conf/extras/coverage.rc
    export TESTING=true

    coverage run    --rcfile="$RCFILE" manage.py test "${@:1}"
    coverage report --rcfile="$RCFILE"
    coverage erase

    cat ./conf/extras/good_job.txt
}


# set DEBUG if missing
set +u
DEBUG="$DEBUG"
set -u

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

    start )
        setup

        [ -z "$DEBUG" ] && LOGGING="--disable-logging" || LOGGING=""
        /usr/local/bin/uwsgi \
            --ini /code/conf/uwsgi.ini \
            --http 0.0.0.0:$WEB_SERVER_PORT \
            $LOGGING
    ;;

    start_dev )
        setup

        python ./manage.py runserver 0.0.0.0:$WEB_SERVER_PORT
    ;;

    health )
        python ./manage.py check_url \
            --url=http://0.0.0.0:$WEB_SERVER_PORT/health
    ;;

    check_kernel )
        python ./manage.py check_url \
            --url=$AETHER_KERNEL_URL \
            --token=$AETHER_KERNEL_TOKEN
    ;;

    check_odk )
        if [[ "$AETHER_MODULES" == *odk* ]];
        then
            python ./manage.py check_url \
                --url=$AETHER_ODK_URL \
                --token=$AETHER_ODK_TOKEN
        else
            echo "No ODK module enabled!"
        fi
    ;;

    check_couchdb_sync )
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
        echo "DEBUG=$DEBUG"
        setup
        test_lint
        test_coverage
    ;;

    test_lint )
        test_lint
    ;;

    test_coverage )
        test_coverage "${@:2}"
    ;;

    test_py )
        test_coverage "${@:2}"
    ;;

    * )
        show_help
    ;;
esac
