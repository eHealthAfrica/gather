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

from django.conf import settings
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.decorators import action

from aether.sdk.multitenancy.views import MtViewSetMixin
from .models import Survey, Mask
from .serializers import SurveySerializer, MaskSerializer
from .utils import (
  configure_consumers,
  delete_survey_subscription,
)
from aether.sdk.multitenancy.utils import get_current_realm
from django.utils.translation import gettext as _


class SurveyViewSet(MtViewSetMixin, ModelViewSet):
    '''
    Handle Survey entries.
    '''

    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    search_fields = ('name',)
    ordering = ('name',)

    @action(detail=True, methods=['post', 'delete'], url_name='consumer', url_path='consumers-config')
    def consumer(self, request, pk=None, *args, **kwargs):
        survey = self.get_object_or_404(pk=pk)
        _survey_name = survey.name
        _headers = {}
        _realm = get_current_realm(request)
        _headers[settings.CONSUMER_TENANCY_HEADER] = _realm

        # Configure Consumers
        if not settings.AUTO_CONFIG_CONSUMERS:
            return Response(_('Consumer auto configuration is turned off'), status=status.HTTP_200_OK)

        consumer_settings = settings.CONSUMER_SETTINGS
        if request.method == 'POST':
            consumers, errors = configure_consumers(consumer_settings, _survey_name, _realm, _headers)
            if errors:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(f'{_("Configured")} {consumers} {_("consumers successfully")}', status=status.HTTP_200_OK)
        else:
            errors = delete_survey_subscription(consumer_settings, _survey_name, _realm, _headers)
            if errors:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(status=status.HTTP_204_NO_CONTENT)


class MaskViewSet(MtViewSetMixin, ModelViewSet):
    '''
    Handle Survey Mask entries.
    '''

    queryset = Mask.objects.all()
    serializer_class = MaskSerializer
    search_fields = ('survey__name', 'name', 'columns',)
    ordering = ('survey', 'name',)
    mt_field = 'survey'
