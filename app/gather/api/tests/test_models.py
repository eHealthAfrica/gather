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

from django.test import TestCase

from ..models import Survey, Mask


class ModelsTests(TestCase):

    def test__models(self):
        survey = Survey.objects.create()

        self.assertEquals(survey.project_id, survey.survey_id)
        self.assertEquals(str(survey), '')

        survey.name = 'Something'
        survey.save()
        self.assertEquals(str(survey), 'Something')

        mask = Mask.objects.create(
            survey=survey,
            name='Masking',
            columns=['a', 'b', 'c'],
        )
        self.assertEquals(str(mask), 'Masking')
        self.assertEqual(mask.get_mt_instance(), mask.survey)
