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

# Any entry here needs the decorator `app_token_required` if it's going to execute
# AJAX request to any of the external apps
from django_eha_sdk.auth.apptoken.decorators import app_token_required

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
    # surveys app
    re_path(route=r'^surveys/(?P<action>\w+)/(?P<survey_id>[0-9a-f-]+)?$',
            view=app_token_required(TemplateView.as_view(template_name='gather/pages/surveys.html')),
            name='surveys'),
]

if 'odk' in settings.AETHER_APPS:
    app_urls += [
        re_path(route=r'^surveyors/(?P<action>\w+)/(?P<surveyor_id>[0-9]+)?$',
                view=app_token_required(TemplateView.as_view(template_name='gather/pages/surveyors.html')),
                name='odk-surveyors'),
    ]

if 'couchdb-sync' in settings.AETHER_APPS:
    app_urls += [
        re_path(route=r'^mobile-users/(?P<action>\w+)$',
                view=app_token_required(TemplateView.as_view(template_name='gather/pages/sync-users.html')),
                name='couchdb-sync-mobile-users'),
    ]


urlpatterns = generate_urlpatterns(app=app_urls)
