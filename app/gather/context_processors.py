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
from django.utils.translation import gettext_lazy as _
from django.urls import reverse

from django_eha_sdk.multitenancy.utils import get_path_realm
from django_eha_sdk.health.utils import get_external_app_url


def gather_context(request):
    def get_url(view_name, kwargs=None):
        # get the url using the gateway path if needed.
        realm = get_path_realm(request)
        kwargs = kwargs or {}
        kwargs = {**kwargs, 'realm': realm} if realm else kwargs
        return reverse(view_name, kwargs=kwargs)

    gather_url = get_url('index-page')[:-1]

    navigation_list = [('surveys', _('Surveys')), ]
    if 'odk' in settings.AETHER_APPS:
        navigation_list.append(('odk-surveyors', _('Surveyors')))
    if 'couchdb-sync' in settings.AETHER_APPS:
        navigation_list.append(('couchdb-sync-mobile-users', _('Mobile users')))

    context = {
        'instance_name': settings.INSTANCE_NAME,
        'navigation_list': navigation_list,
        'gather_url': gather_url,
    }

    for app in settings.AETHER_APPS:
        name = app.replace('-', '_')
        external_app = f'{settings.AETHER_PREFIX}{app}'
        context[f'{name}_url'] = get_external_app_url(external_app, request)

    return context
