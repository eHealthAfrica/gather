# Copyright (C) 2019 by eHealth Africa : http://www.eHealthAfrica.org
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

import copy
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    permission_classes,
    renderer_classes,
)
from rest_framework.renderers import JSONRenderer

from aether.sdk.multitenancy.views import MtViewSetMixin
from .models import Survey, Mask
from .serializers import SurveySerializer, MaskSerializer


class SurveyViewSet(MtViewSetMixin, ModelViewSet):
    '''
    Handle Survey entries.
    '''

    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    search_fields = ('name',)
    ordering = ('name',)


class MaskViewSet(MtViewSetMixin, ModelViewSet):
    '''
    Handle Survey Mask entries.
    '''

    queryset = Mask.objects.all()
    serializer_class = MaskSerializer
    search_fields = ('survey__name', 'name', 'columns',)
    ordering = ('survey', 'name',)
    mt_field = 'survey'


@api_view(['GET'])
@renderer_classes([JSONRenderer])
# @permission_classes([permissions.IsAuthenticated])
def consumer_config_view(request, *args, **kwargs):
  _survey_name = request.data.get('name')
  if not _survey_name:
    Response('Invalid survey name', status=status.HTTP_400_BAD_REQUEST)

  # Configure Consumers
  if settings.AUTO_CONFIG_CONSUMERS:
    cons_settings = copy.deepcopy(settings.CONSUMER_SETTINGS)
    cons_errors = []
    for consumer in cons_settings:
      if not consumer.keys() >= {'resources', 'subscription', 'job', 'url', 'name'}:
        cons_errors += [
          { consumer_name: 'Invalid config settings'}
        ]
        continue

      consumer_name = consumer.pop('name')
      consumer_url = consumer.pop('url')

    Response('Elasticsearch and kibana resources are missing', status=status.HTTP_400_BAD_REQUEST)


  return Response(consumer_url)


