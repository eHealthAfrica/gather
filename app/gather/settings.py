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

import os

from aether.sdk.conf.settings import *  # noqa
from aether.sdk.conf.settings import (
    TEMPLATES,
    MIGRATION_MODULES,
    EXTERNAL_APPS
)


# ------------------------------------------------------------------------------
# Gather Configuration
# ------------------------------------------------------------------------------

INSTANCE_NAME = os.environ.get('INSTANCE_NAME', 'Gather 3')

APP_NAME = os.environ.get('APP_NAME', 'Gather')
APP_NAME_HTML = APP_NAME
APP_LINK = os.environ.get('APP_LINK', 'http://gather.ehealthafrica.org')

APP_FAVICON = 'gather/images/gather.ico'
APP_LOGO = 'gather/images/gather-icon.svg'

APP_EXTRA_STYLE = 'gather/css/styles.css'
APP_EXTRA_META = 'Effortless data collection and curation'


ROOT_URLCONF = 'gather.urls'

TEMPLATES[0]['OPTIONS']['context_processors'] += [
    'gather.context_processors.gather_context',
]

MULTITENANCY_MODEL = 'gather.Survey'
MIGRATION_MODULES['gather'] = 'gather.api.migrations'


# Assets settings
EXPORT_MAX_ROWS_SIZE = os.environ.get('EXPORT_MAX_ROWS_SIZE', '0')


# ------------------------------------------------------------------------------
# Aether external modules
# ------------------------------------------------------------------------------

# build AETHER_APPS from EXTERNAL_APPS dict
AETHER_PREFIX = 'aether-'
AETHER_APPS = [
    key.replace(AETHER_PREFIX, '')
    for key in EXTERNAL_APPS.keys()
    if key.startswith(AETHER_PREFIX)
]

# Upload files
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/2.2/ref/settings/#std:setting-DATA_UPLOAD_MAX_MEMORY_SIZE
# https://docs.djangoproject.com/en/2.2/ref/settings/#std:setting-FILE_UPLOAD_MAX_MEMORY_SIZE

_max_size = 50 * 1024 * 1024  # 50MB
DATA_UPLOAD_MAX_MEMORY_SIZE = int(os.environ.get('DATA_UPLOAD_MAX_MEMORY_SIZE', _max_size))
FILE_UPLOAD_MAX_MEMORY_SIZE = int(os.environ.get('FILE_UPLOAD_MAX_MEMORY_SIZE', _max_size))
