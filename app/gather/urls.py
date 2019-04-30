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
from django.contrib.auth.decorators import login_required
from django.urls import include, path, re_path
from django.views.generic import TemplateView

from django_eha_sdk.conf.urls import generate_urlpatterns
from django_eha_sdk.health.views import health

# Any entry here needs the decorator `tokens_required` if it's going to execute
# AJAX request to any of the other apps
from .api.decorators import login_tokens_required
from .views import assets_settings


app_urls = [
    # assets settings
    path(route='assets-settings', view=assets_settings, name='assets-settings'),

    # ----------------------
    # API
    path(route='api/', view=include('gather.api.urls', namespace='api')),

    # ----------------------
    # Welcome page
    path(route='',
         view=login_required(TemplateView.as_view(template_name='gather/pages/index.html')),
         name='index-page'),

    # ----------------------
    # shows the current user app tokens
    path(route='~tokens',
         view=login_required(TemplateView.as_view(template_name='gather/pages/tokens.html')),
         name='tokens'),

    # to check if the user tokens are valid
    path('check-tokens', view=login_tokens_required(health), name='check-tokens'),

    # ----------------------
    # surveys app
    re_path(route=r'^surveys/(?P<action>\w+)/(?P<survey_id>[0-9a-f-]+)?$',
            view=login_tokens_required(TemplateView.as_view(template_name='gather/pages/surveys.html')),
            name='surveys'),
]

if settings.AETHER_APPS.get('odk'):
    app_urls += [
        re_path(route=r'^surveyors/(?P<action>\w+)/(?P<surveyor_id>[0-9]+)?$',
                view=login_tokens_required(TemplateView.as_view(template_name='gather/pages/surveyors.html')),
                name='odk-surveyors'),
    ]

if settings.AETHER_APPS.get('couchdb-sync'):
    app_urls += [
        re_path(route=r'^mobile-users/(?P<action>\w+)$',
                view=login_tokens_required(TemplateView.as_view(template_name='gather/pages/sync-users.html')),
                name='couchdb-sync-mobile-users'),
    ]


urlpatterns = generate_urlpatterns(app=app_urls)
