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

POSTGRES_PACKAGE=postgresql-client-11
APT_INSTALL="apt-get -qq --yes --allow-downgrades --allow-remove-essential --allow-change-held-packages install"

################################################################################
# install packages
################################################################################

# install missing packages of slim distribution and Gather required ones
PACKAGE_LIST=/tmp/apt-packages.txt
if [ -f "$PACKAGE_LIST" ]; then
    apt-get update -qq > /dev/null
    $APT_INSTALL `cat $PACKAGE_LIST` > /dev/null
fi

# add postgres apt repo to get more recent postgres versions
echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" > /etc/apt/sources.list.d/pgdg.list
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /etc/apt/trusted.gpg.d/postgresql.gpg
apt-get update -qq > /dev/null
$APT_INSTALL $POSTGRES_PACKAGE > /dev/null


################################################################################
# Create user and folders
################################################################################

useradd -ms /bin/false gather

mkdir -p /var/run/gather/log/
touch /var/run/gather/uwsgi.pid

chown -Rf gather: /var/run/gather/*
chmod -R 755      /var/run/gather/*


################################################################################
# cleaning
################################################################################

rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
apt-get clean
apt-get autoremove
