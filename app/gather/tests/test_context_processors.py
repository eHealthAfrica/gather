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
from django.test import RequestFactory, TestCase

from ..context_processors import gather_context


class ContextProcessorsTests(TestCase):

    def test_gather_context(self):
        request = RequestFactory().get('/')
        context = gather_context(request)

        self.assertFalse(context['dev_mode'])

        self.assertEqual(context['app_name'], 'Gather')
        self.assertNotEqual(context['app_version'], '#.#.#')
        self.assertNotEqual(context['app_revision'], '---')
        self.assertEqual(context['instance_name'], 'Gather 3')

        self.assertEqual(context['navigation_list'], ['surveys', 'surveyors', 'sync-users'])
        self.assertEqual(context['kernel_url'], 'http://kernel-test:9100')
        self.assertEqual(context['odk_url'], 'http://odk-test:9102')
        self.assertEqual(context['couchdb_sync_url'], 'http://couchdb-sync-test:9106')

    @mock.patch('gather.context_processors.settings.AETHER_APPS',
                {'kernel': {'url': 'http://localhost'}})
    def test_gather_context__mocked(self):
        request = RequestFactory().get('/')
        context = gather_context(request)

        self.assertNotIn('odk_url', context)
        self.assertNotIn('couchdb_sync_url', context)
        self.assertEqual(context['navigation_list'], ['surveys', ])
