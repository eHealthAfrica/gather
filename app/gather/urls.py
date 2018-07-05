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
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.urls import include, path, re_path
from django.views.generic import TemplateView

# Any entry here needs the decorator `tokens_required` if it's going to execute
# AJAX request to any of the other apps
from .api.decorators import tokens_required
from .views import health


auth_urls = 'rest_framework.urls'
if settings.CAS_SERVER_URL:  # pragma: no cover
    import django_cas_ng.views

    auth_urls = ([
        path('login/', django_cas_ng.views.login, name='login'),
        path('logout/', django_cas_ng.views.logout, name='logout'),
    ], 'rest_framework')


urlpatterns = [

    # `health` endpoint
    path('health', health, name='health'),

    # `admin` section
    path('admin/', admin.site.urls),

    # `accounts` management
    path('accounts/', include(auth_urls, namespace='rest_framework')),

    # ----------------------
    # API
    path('', include('gather.api.urls', namespace='gather')),
    path('v1/', include('gather.api.urls', namespace='v1')),

    # ----------------------
    # Welcome page
    path('',
         login_required(TemplateView.as_view(template_name='pages/index.html')),
         name='index-page'),

    # ----------------------
    # shows the current user app tokens
    path('~tokens',
         login_required(TemplateView.as_view(template_name='pages/tokens.html')),
         name='tokens'),
    # to check if the user tokens are valid
    path('check-tokens', login_required(tokens_required(health)), name='check-tokens'),

    re_path(r'^surveys/(?P<action>\w+)/(?P<survey_id>[0-9a-f-]+)?$',
            login_required(tokens_required(TemplateView.as_view(template_name='pages/surveys.html'))),
            name='surveys'),
]

if settings.AETHER_ODK:  # pragma: no cover
    urlpatterns += [
        re_path(r'^surveyors/(?P<action>\w+)/(?P<surveyor_id>[0-9]+)?$',
                login_required(tokens_required(TemplateView.as_view(template_name='pages/surveyors.html'))),
                name='surveyors'),
    ]

if settings.DEBUG:  # pragma: no cover
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns += [
            path('__debug__/', include(debug_toolbar.urls)),
        ]