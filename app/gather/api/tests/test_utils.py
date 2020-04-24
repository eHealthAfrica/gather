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

import copy
import responses
from requests.exceptions import HTTPError
from django.test import TestCase
from django.conf import settings

from ..utils import (
    __clean_name as clean_name,
    configure_consumers,
    consumer_request,
    delete_survey_subscription,
    get_env_variables,
    get_resource_env,
    upsert_resource
)


class UtilsTests(TestCase):

    @responses.activate
    def test_consumer_request(self):
        test_url = 'http://test.gather.local/api/consumer-config'
        test_data = {'success': 'test consumer api'}
        test_url_error = 'http://test.gather.local/api/consumer-config-error'
        test_data_error = {'error': 'Something went wrong'}
        test_url_health = 'http://test.gather.local/consumer/health'
        responses.add(
            responses.GET, test_url,
            json=test_data,
            status=200
        )
        responses.add(
            responses.GET, test_url_error,
            json=test_data_error,
            status=500
        )
        responses.add(
            responses.GET, test_url_health,
            body='healthy',
            status=200
        )

        res = consumer_request(test_url)
        self.assertEqual(res, test_data)
        with self.assertRaises(HTTPError) as exec:
            consumer_request(test_url_error)
        self.assertIn('500 Server Error', str(exec.exception))
        res = consumer_request(test_url_health)
        self.assertEqual(res.decode('utf-8'), 'healthy')

    def test_clean_name(self):
        self.assertEqual(
            clean_name('SUrvey *with Spaces-'),
            'SurveyWithSpaces'
        )

    @responses.activate
    def test_upsert_resource(self):
        test_settings = copy.deepcopy(settings.CONSUMER_SETTINGS)
        test_base_url = 'http://test.local/'

        test_resource = test_settings[0]['job']
        resource_id = test_resource.pop('id')

        with self.assertRaises(Exception) as exec:
            upsert_resource(test_base_url, 'job', test_resource)
        self.assertEqual('job: No id provided', str(exec.exception))

        test_resource['id'] = resource_id
        test_resource['subscription'] = ['old-sub']

        test_url_job_list = f'{test_base_url}job/list'
        responses.add(
            responses.GET, test_url_job_list,
            json=[resource_id],
            status=200
        )

        test_url_job_get = f'{test_base_url}job/get?id={resource_id}'
        responses.add(
            responses.GET, test_url_job_get,
            json={
                'id': 'job-id-1',
                'subscription': ['old-sub']
            },
            status=200
        )

        expected_sub = ['old-sub', 'new-sub']

        test_url_job_update = f'{test_base_url}job/update?id={resource_id}'
        responses.add(
            responses.POST, test_url_job_update,
            json={
                'id': 'job-id-1',
                'subscription': expected_sub
            },
            status=200
        )

        res = upsert_resource(test_base_url, 'job', test_resource)
        self.assertEqual(res['subscription'], expected_sub)

    @responses.activate
    def test_configure_consumers(self):
        c_settings = copy.deepcopy(settings.CONSUMER_SETTINGS)

        resources = c_settings[0].pop('resources')
        consumers, errors = configure_consumers(c_settings, 'Test Survey 1', 'test')
        self.assertEqual(len(errors), 1)
        self.assertEqual(errors[0], {'es': 'Invalid config settings'})

        c_settings[0]['resources'] = resources
        consumers, errors = configure_consumers(c_settings, 'Test Survey 2', 'test')
        self.assertEqual(len(errors), 1)
        self.assertEqual(errors[0], {'es': 'Consumer is offline'})

        test_base_url = 'http://test.gather.local/'
        test_url_health = f'{test_base_url}health'
        responses.add(
            responses.GET, test_url_health,
            body='healthy',
            status=200
        )

        c_settings = copy.deepcopy(settings.CONSUMER_SETTINGS)
        c_settings[0]['url'] = test_base_url
        consumers, errors = configure_consumers(c_settings, 'Test Survey 3', 'test')
        self.assertEqual(len(errors), 4)
        self.assertEqual(len(consumers), 1)
        self.assertEqual(consumers[0], 'es')

        c_settings = copy.deepcopy(settings.CONSUMER_SETTINGS)
        sub_id = 'test-testsurvey4-subscription-id'
        test_url_subscription_list = f'{test_base_url}subscription/list'
        responses.add(
            responses.GET, test_url_subscription_list,
            json=[sub_id],
            status=200
        )

        test_url_subscription_update = f'{test_base_url}subscription/update?id={sub_id}'
        responses.add(
            responses.POST, test_url_subscription_update,
            body='true',
            status=200
        )

        resources = ['elasticsearch', 'kibana', 'job']

        for r in resources:
            test_url_resouce_list = f'{test_base_url}{r}/list'
            responses.add(
                responses.GET, test_url_resouce_list,
                json=[],
                status=200
            )

            test_url_resouce_add = f'{test_base_url}{r}/add'
            responses.add(
                responses.POST, test_url_resouce_add,
                body='true',
                status=200
            )

        c_settings[0]['url'] = test_base_url
        c_settings[0]['subscription']['id'] = sub_id
        consumers, errors = configure_consumers(c_settings, 'Test Survey 4', 'test')
        self.assertEqual(len(errors), 0)
        self.assertEqual(len(consumers), 1)
        self.assertEqual(consumers[0], 'es')

    @responses.activate
    def test_delete_survey_subscription(self):
        test_base_url = 'http://test.local/'
        c_settings = copy.deepcopy(settings.CONSUMER_SETTINGS)
        c_settings[0]['url'] = test_base_url
        errors = delete_survey_subscription(c_settings, 'Test Survey 1', 'test')
        self.assertEqual(len(errors), 1)

        test_url_resouce_list = f'{test_base_url}job/list'
        job_id = 'test-job-id'
        job_id_1 = 'test-job-id-2'
        sub_id = 'test-testsurvey2-subscription-id'
        responses.add(
            responses.GET, test_url_resouce_list,
            json=[job_id, job_id_1],
            status=200
        )

        test_url_resouce_get = f'{test_base_url}job/get?id={job_id}'
        responses.add(
            responses.GET, test_url_resouce_get,
            json={
                'subscription': [sub_id, 'another-sub'],
                'id': job_id,

            },
            status=200
        )

        test_url_resouce_get = f'{test_base_url}job/get?id={job_id_1}'
        responses.add(
            responses.GET, test_url_resouce_get,
            json={
                'subscription': [sub_id],
                'id': job_id,

            },
            status=200
        )

        test_url_resouce_delete = f'{test_base_url}subscription/delete?id={sub_id}'
        responses.add(
            responses.DELETE, test_url_resouce_delete,
            body='true',
            status=201
        )

        test_url_resouce_update = f'{test_base_url}job/update?id={job_id}'
        responses.add(
            responses.POST, test_url_resouce_update,
            body='true',
            status=200
        )

        test_url_resouce_delete = f'{test_base_url}subscription/delete?id={sub_id}'
        responses.add(
            responses.GET, test_url_resouce_delete,
            body='true',
            status=200
        )

        test_url_resouce_delete = f'{test_base_url}job/delete?id={job_id_1}'
        responses.add(
            responses.GET, test_url_resouce_delete,
            body='true',
            status=200
        )

        c_settings = copy.deepcopy(settings.CONSUMER_SETTINGS)
        c_settings[0]['url'] = test_base_url
        errors = delete_survey_subscription(c_settings, 'Test Survey 2', 'test')
        self.assertEqual(len(errors), 0)

        c_settings = copy.deepcopy(settings.CONSUMER_SETTINGS)
        c_settings[0]['url'] = test_base_url
        errors = delete_survey_subscription(c_settings, 'Test Survey 3', 'test')
        self.assertEqual(len(errors), 1)

        def test_get_env_variables(self):
            test_consumer_name = 'test'
            variables = get_env_variables(test_consumer_name)
            self.assertEqual(len(variables), 2)
            self.assertIn('TEST_VARIABLE_1', variables)
            self.assertIn('TEST_VARIABLE_2', variables)

        def test_get_resource_env(self):
            consumer_variables = {
                'TEST_KIBANA_USERNAME': 'user',
                'TEST_KIBANA_PASSWORD': 'password',
                'TEST_ES_APIKEY': 'test_api_key'
            }
            self.assertEqual(len(consumer_variables), 3)
            resource_variables = get_resource_env(consumer_variables, 'test', 'kibana')
            self.assertEqual(len(resource_variables), 2)
            self.assertIn('USERNAME', resource_variables)
            self.assertIn('PASSWORD', resource_variables)
            self.assertEqual(resource_variables['PASSWORD'], 'password')
