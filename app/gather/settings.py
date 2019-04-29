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

import os

# ------------------------------------------------------------------------------
# Common settings
# ------------------------------------------------------------------------------

from django_eha_sdk.conf.settings import *  # noqa
from django_eha_sdk.conf.settings import (
    TESTING,
    TEMPLATES,
    MIGRATION_MODULES,
    EXTERNAL_APPS
)


# Common Configuration
# ------------------------------------------------------------------------------

APP_NAME = os.environ.get('APP_NAME', 'Gather')
APP_LINK = os.environ.get('APP_LINK', 'http://gather.ehealthafrica.org')

APP_NAME_HTML = APP_NAME
APP_FAVICON = 'gather/images/gather.ico'
APP_LOGO = 'gather/images/gather-icon.svg'

APP_EXTRA_STYLE = 'gather/css/styles.css'
APP_EXTRA_META = 'Effortless data collection and curation'


# Site Configuration
# ------------------------------------------------------------------------------

LOGIN_TEMPLATE = os.environ.get('LOGIN_TEMPLATE', 'pages/login.html')
LOGGED_OUT_TEMPLATE = os.environ.get('LOGGED_OUT_TEMPLATE', 'pages/logged_out.html')


# ------------------------------------------------------------------------------
# Gather Configuration
# ------------------------------------------------------------------------------

ROOT_URLCONF = 'gather.urls'

INSTANCE_NAME = os.environ.get('INSTANCE_NAME', 'Gather 3')

DATA_UPLOAD_MAX_MEMORY_SIZE = 50 * 1024 * 1024  # 50MB

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

# extract AETHER_APPS from EXTERNAL_APPS dict
_prefix = 'aether-' if not TESTING else 'test-aether-'
AETHER_APPS = {
    key.replace(_prefix, ''): value
    for key, value in EXTERNAL_APPS.items()
    if key.startswith(_prefix)
}
