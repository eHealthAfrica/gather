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

from unittest import mock

from django.test import RequestFactory, override_settings
from django_eha_sdk.unittest import UrlsTestCase

from ..context_processors import gather_context


class ContextProcessorsTests(UrlsTestCase):

    def test_gather_context(self):
        request = RequestFactory().get('/')
        context = gather_context(request)

        self.assertEqual(context['gather_url'], '')

        self.assertEqual(len(context['navigation_list']), 3)
        self.assertEqual(context['navigation_list'][0][0], 'surveys')
        self.assertEqual(context['navigation_list'][1][0], 'odk-surveyors')
        self.assertEqual(context['navigation_list'][2][0], 'couchdb-sync-mobile-users')

        self.assertIn('kernel_url', context)
        self.assertIn('odk_url', context)
        self.assertIn('couchdb_sync_url', context)

    @mock.patch('gather.context_processors.settings.AETHER_APPS', ['kernel'])
    @mock.patch('gather.context_processors.settings.EXTERNAL_APPS',
                {'aether-kernel': {'test': {'url': 'http://localhost'}}})
    def test_gather_context__mocked(self):
        request = RequestFactory().get('/')
        context = gather_context(request)

        self.assertEqual(len(context['navigation_list']), 1)
        self.assertEqual(context['navigation_list'][0][0], 'surveys')

        self.assertIn('kernel_url', context)
        self.assertNotIn('odk_url', context)
        self.assertNotIn('couchdb_sync_url', context)


@override_settings(
    GATEWAY_ENABLED=True,
    GATEWAY_SERVICE_ID='gather',
    GATEWAY_PUBLIC_REALM='-',
)
class ContextProcessorsGatewayTests(UrlsTestCase):

    def test_gather_context(self):
        request = RequestFactory().get('/gather')
        context = gather_context(request)

        self.assertEqual(context['gather_url'], '')

    def test_gather_context__with_path(self):
        request = RequestFactory().get('/something/gather/health')
        context = gather_context(request)

        self.assertEqual(context['gather_url'], '/something/gather')


@override_settings(APP_URL='/gather')
class ContextProcessorsAppUrlTests(UrlsTestCase):

    def test_gather_context(self):
        request = RequestFactory().get('/')
        context = gather_context(request)

        self.assertEqual(context['gather_url'], '/gather')
