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

# This script can be used to generate an ".env" for local development with
# docker compose.
#
# Example:
# ./scripts/generate-credentials.sh > .env

function check_openssl {
    which openssl > /dev/null
}

function gen_random_string {
    openssl rand -hex 16 | tr -d "\n"
}

check_openssl
RET=$?
if [ $RET -eq 1 ]; then
    echo "Please install 'openssl'"
    exit 1
fi

set -Eeo pipefail

cat << EOF
#
# USE THIS ONLY LOCALLY
#
# Variables in this file will be substituted into docker-compose-ZZZ.yml
# Save a copy of this file as ".env" and insert your own values.
#
# Verify correct substitution with:
#
#   docker-compose config
#   docker-compose -f docker-compose-test.yml config
#
# If variables are newly added or enabled,
# please restart the images to pull in changes:
#
#   docker-compose restart {container-name}
#


# ------------------------------------------------------------------
# Aether
# ==================================================================
AETHER_VERSION=alpha

# used in docker-compose-local.yml
AETHER_PATH=../aether

# to speed up development changes in the Aether Django SDK library
# https://github.com/eHealthAfrica/aether-django-sdk-library
AETHER_SDK_PATH=../aether-django-sdk-library

# to speed up development changes in the Aether Python library
# https://github.com/eHealthAfrica/aether-python-library
AETHER_PYTHON_PATH=../aether-python-library
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Redis
# ==================================================================
REDIS_PASSWORD=$(gen_random_string)
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Entity Extractor
# ==================================================================
WRITE_ENTITIES_TO_REDIS=
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Gather
# ==================================================================
GATHER_ADMIN_USERNAME=admin
GATHER_ADMIN_PASSWORD=adminadmin

GATHER_DJANGO_SECRET_KEY=$(gen_random_string)
GATHER_DB_PASSWORD=$(gen_random_string)
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Aether Kernel
# ==================================================================
KERNEL_ADMIN_USERNAME=admin
KERNEL_ADMIN_PASSWORD=adminadmin
KERNEL_ADMIN_TOKEN=$(gen_random_string)

KERNEL_DJANGO_SECRET_KEY=$(gen_random_string)
KERNEL_DB_PASSWORD=$(gen_random_string)

KERNEL_READONLY_DB_USERNAME=readonlyuser
KERNEL_READONLY_DB_PASSWORD=$(gen_random_string)
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Aether ODK Module
# ==================================================================
ODK_ADMIN_USERNAME=admin
ODK_ADMIN_PASSWORD=adminadmin
ODK_ADMIN_TOKEN=$(gen_random_string)

ODK_DJANGO_SECRET_KEY=$(gen_random_string)
ODK_DB_PASSWORD=$(gen_random_string)
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Aether UI
# ==================================================================
UI_ADMIN_USERNAME=admin
UI_ADMIN_PASSWORD=adminadmin

UI_DJANGO_SECRET_KEY=$(gen_random_string)
UI_DB_PASSWORD=$(gen_random_string)
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Minio storage
# ==================================================================
MINIO_STORAGE_ACCESS_KEY=$(gen_random_string)
MINIO_STORAGE_SECRET_KEY=$(gen_random_string)
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Multitenancy
# ==================================================================
DEFAULT_REALM=gather
REALM_COOKIE=gather-realm
MULTITENANCY=yes
# ------------------------------------------------------------------


# ------------------------------------------------------------------
# Redis
# ==================================================================
REDIS_PASSWORD=$(gen_random_string)
# ------------------------------------------------------------------
EOF
