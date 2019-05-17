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

import uuid

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.translation import gettext_lazy as _

from django_prometheus.models import ExportModelOperationsMixin
from django_eha_sdk.multitenancy.models import MtModelAbstract, MtModelChildAbstract

'''

Data model schema:

    +------------------+       +------------------+
    | Survey / Project |       | Mask             |
    +==================+       +==================+
    | project_id       |<--+   | id               |
    | name             |   |   | name             |
    +------------------+   |   | columns          |
                           |   +::::::::::::::::::+
                           +--<| survey           |
                               +------------------+

'''


class Survey(ExportModelOperationsMixin('gather_survey'), MtModelAbstract):
    '''
    Database link of a Aether Kernel Project
    '''

    # This is needed to match data with kernel
    # (there is a one to one relation)
    project_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        verbose_name=_('project ID'),
        help_text=_('This ID corresponds to an Aether Kernel project ID.'),
    )
    name = models.TextField(null=True, blank=True, default='', verbose_name=_('name'))

    @property
    def survey_id(self):
        return self.project_id or ''

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'gather'
        default_related_name = 'surveys'
        verbose_name = _('survey')
        verbose_name_plural = _('surveys')


class Mask(ExportModelOperationsMixin('gather_mask'), MtModelChildAbstract):
    '''
    Survey entities mask.

    Indicates the entity columns to display in all views and downloads.
    '''

    survey = models.ForeignKey(to=Survey, on_delete=models.CASCADE, verbose_name=_('survey'))

    name = models.TextField(verbose_name=_('name'))
    columns = ArrayField(
        base_field=models.TextField(verbose_name=_('column internal name')),
        verbose_name=_('masked columns'),
        help_text=_('Comma separated list of column internal names')
    )

    def __str__(self):
        return self.name

    def get_mt_instance(self):
        return self.survey

    class Meta:
        app_label = 'gather'
        default_related_name = 'masks'
        unique_together = ('survey', 'name')
        verbose_name = _('mask')
        verbose_name_plural = _('masks')
