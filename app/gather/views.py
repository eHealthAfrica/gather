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

from django.conf import settings
from django.db import connection
from django.db.utils import OperationalError
from django.http import JsonResponse
from django.utils.translation import ugettext as _


def health(*args, **kwargs):
    '''
    Simple view to check if the system is up.
    '''

    return JsonResponse({})


def check_db(*args, **kwargs):
    '''
    Health check for the database connection.
    '''

    try:
        connection.cursor()
        return JsonResponse({})

    except OperationalError as e:
        return JsonResponse({'message': str(e)}, status=500)

    except Exception:
        return JsonResponse({'message': _('Connection with database was not possible')}, status=500)


def assets_settings(*args, **kwargs):
    '''
    Returns the list of settings needed by the assets
    '''

    return JsonResponse({
        'aether_apps': list(settings.AETHER_APPS.keys()),

        # CSV export
        'csv_header_rules': settings.CSV_HEADER_RULES,
        'csv_header_rules_sep': settings.CSV_HEADER_RULES_SEP,
        'csv_max_rows_size': int(settings.CSV_MAX_ROWS_SIZE),
    })
