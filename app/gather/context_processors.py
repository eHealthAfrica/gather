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


def gather_context(request):
    navigation_list = ['surveys', ]
    if settings.AETHER_APPS.get('odk'):
        navigation_list.append('surveyors')
    if settings.AETHER_APPS.get('couchdb-sync'):
        navigation_list.append('sync-users')

    context = {
        'dev_mode': settings.DEBUG,

        'app_name': settings.APP_NAME,
        'app_version': settings.VERSION,
        'app_revision': settings.REVISION,

        'instance_name': settings.INSTANCE_NAME,
        'navigation_list': navigation_list,
    }

    for key, value in settings.AETHER_APPS.items():
        name = key.replace('-', '_')
        context[f'{name}_url'] = value['url']

    return context
