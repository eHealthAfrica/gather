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

check_variable() {
  if [ -n "$1" ];
  then
    echo "$2 in Ordnung!"
  else
    echo "Missing $2"
    exit -1
  fi
}

check_kernel() {
  # check if KERNEL env variables were set
  check_variable $AETHER_KERNEL_URL   "Aether KERNEL url (AETHER_KERNEL_URL)"
  check_variable $AETHER_KERNEL_TOKEN "Aether KERNEL token (AETHER_KERNEL_TOKEN)"
}

check_odk() {
  if [[ "$AETHER_MODULES" == *odk* ]];
  then
    # check if ODK env variables were set only if it's included in the modules list.
    check_variable $AETHER_ODK_URL   "Aether ODK url (AETHER_ODK_URL)"
    check_variable $AETHER_ODK_TOKEN "Aether ODK token (AETHER_ODK_TOKEN)"
  fi
}

# Django requirements
check_variable $DJANGO_SECRET_KEY "Django secret key (DJANGO_SECRET_KEY)"
check_variable $ADMIN_USERNAME    "Admin user username (ADMIN_USERNAME)"
check_variable $ADMIN_PASSWORD    "Admin user password (ADMIN_PASSWORD)"

# Aether requirements
check_kernel
check_odk
