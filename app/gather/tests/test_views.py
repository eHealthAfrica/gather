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

import mock

from django.db.utils import OperationalError
from django.urls import reverse
from django.test import TestCase

from rest_framework import status


class ViewsTest(TestCase):

    def test__health(self):
        self.assertEqual(reverse('health'), '/health')
        response = self.client.get(reverse('health'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {})

    def test__check_db(self, *args):
        response = self.client.get(reverse('check-db'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {})

    @mock.patch('gather.views.connection.cursor', side_effect=OperationalError)
    def test__check_db__operational_error(self, *args):
        response = self.client.get(reverse('check-db'))
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)

    @mock.patch('gather.views.connection.cursor', side_effect=RuntimeError)
    def test__check_db__another_error(self, *args):
        response = self.client.get(reverse('check-db'))
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.json(),
                         {'message': 'Connection with database was not possible'})

    def test__assets_settings(self):
        self.assertEqual(reverse('assets-settings'), '/assets-settings')
        response = self.client.get(reverse('assets-settings'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {
            'aether_apps': ['kernel', 'odk', 'couchdb-sync'],
            'export_format': 'csv',
            'export_max_rows_size': 0,
        })
