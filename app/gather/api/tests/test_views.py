# Copyright (C) 2020 by eHealth Africa : http://www.eHealthAfrica.org
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

from unittest import mock
import json
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model


class ViewsTest(TestCase):
    def setUp(self):
        username = 'test'
        email = 'test@example.com'
        password = 'testtest'
        self.user = get_user_model().objects.create_user(username, email, password)
        self.assertTrue(self.client.login(username=username, password=password))

    def test_consumer_config(self):
        url = reverse('consumers-config')
        data = json.dumps({
            'name': 'Test Survey 1'
        })
        res = self.client.post(
            url,
            data=data,
            content_type='application/json'
        )
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json(), [{'es': 'Consumer is offline'}])

        res = self.client.post(url, data={}, content_type='application/json')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(res.json(), 'Missing survey name')

    def test_consumer_config_mock(self, *args):
        url = reverse('consumers-config')
        data = json.dumps({
            'name': 'Test Survey 1'
        })
        with mock.patch('gather.api.views.configure_consumers') as mock_configure_consumers:
            mock_configure_consumers.return_value = (['es'], [])
            res = self.client.post(url, data=data, content_type='application/json')
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json(), "Configured ['es'] consumers successfully")

        with mock.patch('gather.api.views.delete_survey_subscription') as mock_delete_survey_subscription:
            mock_delete_survey_subscription.return_value = []
            res = self.client.delete(url, data=data, content_type='application/json')
            self.assertEqual(res.status_code, 204)

            mock_delete_survey_subscription.return_value = ['has-error']
            res = self.client.delete(url, data=data, content_type='application/json')
            self.assertEqual(res.status_code, 400)
            self.assertEqual(res.json(), ['has-error'])

        with self.settings(AUTO_CONFIG_CONSUMERS=False):
            res = self.client.post(url, data=data, content_type='application/json')
            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json(), 'Consumer auto configuration is turned off')
