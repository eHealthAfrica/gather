# Copyright (C) 2023 by eHealth Africa : http://www.eHealthAfrica.org
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

from .api.models import Survey, Mask


if settings.MULTITENANCY:  # pragma: no cover
    PROJECT_LIST_FILTER = (
        ('mt__realm', admin.EmptyFieldListFilter),
        'mt__realm',
    )
    MASK_LIST_FILTER = (
        ('survey__mt__realm', admin.EmptyFieldListFilter),
        'survey__mt__realm',
    )

else:  # pragma: no cover
    PROJECT_LIST_FILTER = []
    MASK_LIST_FILTER = []


class SurveyAdmin(admin.ModelAdmin):

    list_display = ('project_id', 'name',)
    search_fields = ('name',)
    ordering = list_display
    list_filter = PROJECT_LIST_FILTER


class MaskAdmin(admin.ModelAdmin):

    list_display = ('survey', 'name', 'columns',)
    search_fields = ('survey__name', 'name', 'columns',)
    ordering = list_display
    list_filter = MASK_LIST_FILTER


admin.site.register(Survey, SurveyAdmin)
admin.site.register(Mask, MaskAdmin)
