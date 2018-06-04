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
set -e


# Define help message
show_help() {
    echo """
    Commands
    ----------------------------------------------------------------------------
    bash          : run bash
    eval          : eval shell command
    manage        : invoke django manage.py commands

    pip_freeze    : freeze pip dependencies and write to requirements.txt

    setupproddb   : create/migrate database for production
    setuplocaldb  : create/migrate database for development (creates superuser)

    test          : run tests
    test_lint     : run flake8 tests
    test_coverage : run python tests with coverage output
    test_py       : alias of test_coverage
    test_js       : run js tests

    start         : start webserver behind nginx
    start_dev     : start webserver for development
    start_webpack : start webpack server (only in DEV mode)
    """
}

setup_db() {
    export PGPASSWORD=$RDS_PASSWORD
    export PGHOST=$RDS_HOSTNAME
    export PGUSER=$RDS_USERNAME

    until pg_isready -q; do
      >&2 echo "Waiting for postgres..."
      sleep 1
    done

    if psql -c "" $RDS_DB_NAME; then
      echo "$RDS_DB_NAME database exists!"
    else
      createdb -e $RDS_DB_NAME -e ENCODING=UTF8
      echo "$RDS_DB_NAME database created!"
    fi

    # migrate data model if needed
    ./manage.py migrate --noinput
}

setup_initial_data() {
    # create initial superuser
    ./manage.py loaddata /code/conf/extras/initial.json
}

setup_projects() {
     # Wait for kernel to become available
    until $(curl --output /dev/null --silent --head $AETHER_KERNEL_URL); do
        >&2 echo 'Waiting for Aether kernel...'
        sleep 1
    done
    # Set up Aether and Gather projects and ensure that they are in sync
    ./manage.py setup_aether_project
}

setup_prod() {
  # check if vars exist
  /code/conf/check_vars.sh
  # arguments: -u=admin -p=secretsecret -e=admin@gather2.org -t=01234656789abcdefghij
  ./manage.py setup_admin -p=$ADMIN_PASSWORD
}

test_lint() {
    npm run test-lint
    flake8 /code/. --config=/code/conf/extras/flake8.cfg
}

test_coverage() {
    export RCFILE=/code/conf/extras/coverage.rc
    export TESTING=true

    coverage run    --rcfile="$RCFILE" manage.py test "${@:1}"
    coverage report --rcfile="$RCFILE"
    coverage erase

    cat /code/conf/extras/good_job.txt
}

test_js() {
    npm run test-js "${@:1}"
}


# --------------------------------
# set DJANGO_SECRET_KEY if needed
if [ "$DJANGO_SECRET_KEY" = "" ]
then
   export DJANGO_SECRET_KEY=$(
        cat /dev/urandom | tr -dc 'a-zA-Z0-9-_!@#$%^&*()_+{}|:<>?=' | fold -w 64 | head -n 4
    )
fi
# --------------------------------


case "$1" in
    bash )
        bash
    ;;

    eval )
        eval "${@:2}"
    ;;

    manage )
        ./manage.py "${@:2}"
    ;;

    pip_freeze )
        rm -rf /tmp/env
        pip install -f ./conf/pip/dependencies -r ./conf/pip/primary-requirements.txt --upgrade

        cat /code/conf/pip/requirements_header.txt | tee conf/pip/requirements.txt
        pip freeze --local | grep -v appdir | tee -a conf/pip/requirements.txt
    ;;

    setuplocaldb )
        setup_db
        setup_initial_data
        setup_projects
    ;;

    setuptestdb )
        setup_db
        setup_initial_data
    ;;

    setupproddb )
        setup_db
    ;;

    test)
        test_lint
        test_js

        # remove previous files
        rm -r -f /code/gather/assets/bundles/*
        npm run webpack

        test_coverage "${@:2}"
    ;;

    test_lint)
        test_lint
    ;;

    test_coverage)
        test_coverage "${@:2}"
    ;;

    test_py)
        test_coverage "${@:2}"
    ;;

    test_js)
        test_js "${@:2}"
    ;;

    start )
        setup_db
        setup_prod
        setup_projects

        # remove previous files
        rm -r -f /code/gather/assets/bundles/*
        npm run webpack

         # create static assets
        ./manage.py collectstatic --noinput
        cp -r /code/gather/assets/bundles/* /var/www/static/
        chmod -R 755 /var/www/static

        # media assets
        chown gather: /media

        /usr/local/bin/uwsgi --ini /code/conf/uwsgi.ini
    ;;

    start_dev )
        setup_db
        setup_initial_data
        setup_projects

        ./manage.py runserver 0.0.0.0:$WEB_SERVER_PORT
    ;;

    start_webpack )
        # remove previous files
        rm -r -f /code/gather/assets/bundles/*
        npm run webpack-server
    ;;

    help)
        show_help
    ;;

    *)
        show_help
    ;;
esac
