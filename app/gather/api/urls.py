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
from django.urls import path, include

from rest_framework import routers

from .decorators import tokens_required
from . import views

router = routers.DefaultRouter()

# create `projects` entry for concordance with aether
router.register('projects', views.SurveyViewSet, base_name='projects')
router.register('surveys', views.SurveyViewSet, base_name='surveys')
router.register('masks', views.MaskViewSet, base_name='masks')

urlpatterns = [
    path('gather/', include(router.urls)),
]

for app in settings.AETHER_APPS:
    urlpatterns += [
        path(f'{app}/',
             login_required(tokens_required(views.TokenProxyView.as_view(app_name=app))),
             name=f'{app}-proxy-root'),
        path(f'{app}/<path:path>',
             login_required(tokens_required(views.TokenProxyView.as_view(app_name=app))),
             name=f'{app}-proxy-path'),
    ]

app_name = 'api'
