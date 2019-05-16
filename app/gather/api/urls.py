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
from django.urls import path, include

from rest_framework import routers

from django_eha_sdk.auth.apptoken.decorators import app_token_required
from django_eha_sdk.auth.apptoken.views import TokenProxyView

from . import views

router = routers.DefaultRouter()

# create `projects` entry for concordance with aether
router.register('projects', views.SurveyViewSet, base_name='projects')
router.register('surveys', views.SurveyViewSet, base_name='surveys')
router.register('masks', views.MaskViewSet, base_name='masks')

urlpatterns = [
    path(route='gather/', view=include(router.urls)),
]

for app in settings.AETHER_APPS:
    external_app = f'{settings.AETHER_PREFIX}{app}'

    urlpatterns += [
        path(route=f'{app}/',
             view=app_token_required(TokenProxyView.as_view(app_name=external_app)),
             name=f'{app}-proxy-root'),
        path(route=f'{app}/<path:path>',
             view=app_token_required(TokenProxyView.as_view(app_name=external_app)),
             name=f'{app}-proxy-path'),
    ]
