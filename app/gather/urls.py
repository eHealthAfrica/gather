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
from .views import health, check_db, assets_settings


# `accounts` management
if settings.CAS_SERVER_URL:
    from django_cas_ng import views

    login_view = views.login
    logout_view = views.logout

else:
    from django.contrib.auth import views

    login_view = views.LoginView.as_view(template_name=settings.LOGIN_TEMPLATE)
    logout_view = views.LogoutView.as_view(template_name=settings.LOGGED_OUT_TEMPLATE)

auth_urls = ([
    path(route='login/', view=login_view, name='login'),
    path(route='logout/', view=logout_view, name='logout'),
], 'rest_framework')


urlpatterns = [

    # `health` endpoint
    path(route='health', view=health, name='health'),
    path(route='check-db', view=check_db, name='check-db'),

    # assets settings
    path(route='assets-settings', view=assets_settings, name='assets-settings'),

    # `admin` section
    path(route='admin/uwsgi/', view=include('django_uwsgi.urls')),
    path(route='admin/', view=admin.site.urls),

    # `accounts` management
    path(route='accounts/', view=include(auth_urls, namespace='rest_framework')),

    # ----------------------
    # API
    path(route='api/', view=include('gather.api.urls', namespace='api')),

    # ----------------------
    # Welcome page
    path(route='',
         view=login_required(TemplateView.as_view(template_name='pages/index.html')),
         name='index-page'),

    # ----------------------
    # shows the current user app tokens
    path(route='~tokens',
         view=login_required(TemplateView.as_view(template_name='pages/tokens.html')),
         name='tokens'),

    # to check if the user tokens are valid
    path('check-tokens', view=login_required(tokens_required(health)), name='check-tokens'),

    # ----------------------
    # surveys app
    re_path(route=r'^surveys/(?P<action>\w+)/(?P<survey_id>[0-9a-f-]+)?$',
            view=login_required(tokens_required(TemplateView.as_view(template_name='pages/surveys.html'))),
            name='surveys'),
]

if settings.AETHER_APPS.get('odk'):
    urlpatterns += [
        re_path(route=r'^surveyors/(?P<action>\w+)/(?P<surveyor_id>[0-9]+)?$',
                view=login_required(tokens_required(TemplateView.as_view(template_name='pages/surveyors.html'))),
                name='odk-surveyors'),
    ]

if settings.AETHER_APPS.get('couchdb-sync'):
    urlpatterns += [
        re_path(route=r'^mobile-users/(?P<action>\w+)$',
                view=login_required(tokens_required(TemplateView.as_view(template_name='pages/sync-users.html'))),
                name='couchdb-sync-mobile-users'),
    ]

if settings.DEBUG:  # pragma: no cover
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns += [
            path(route='__debug__/', view=include(debug_toolbar.urls)),
        ]

app_url = settings.APP_URL[1:]  # remove leading slash
if app_url:
    # Prepend url endpoints with "{APP_URL}/"
    # if APP_URL = "/gather-app" then
    # all the url endpoints will be  `<my-server>/gather-app/<endpoint-url>`
    # before they were  `<my-server>/<endpoint-url>`
    urlpatterns = [
        path(route=f'{app_url}/', view=include(urlpatterns))
    ]
