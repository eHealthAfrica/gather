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

# Generate credentials if missing
if [ -e ".env" ]; then
    echo "[.env] file already exists! Remove it if you want to generate a new one."
else
    ./scripts/generate-credentials.sh > .env
fi

set -Eeuo pipefail

# build Gather assets
docker-compose build gather-assets
docker-compose run   gather-assets build

VERSION=`git rev-parse --abbrev-ref HEAD`
GIT_REVISION=`git rev-parse HEAD`

# build Gather
docker-compose build \
    --build-arg GIT_REVISION=$GIT_REVISION \
    --build-arg VERSION=$VERSION \
    gather
