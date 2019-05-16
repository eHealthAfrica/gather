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

from django.test import override_settings
from django.urls import reverse, exceptions

from django_eha_sdk.unittest import UrlsTestCase


class UrlsTest(UrlsTestCase):

    def test__urls__aether(self):
        self.assertEqual(reverse('surveys', kwargs={'action': 'a'}), '/surveys/a/')
        self.assertEqual(reverse('odk-surveyors', kwargs={'action': 'b'}), '/surveyors/b/')
        self.assertEqual(reverse('couchdb-sync-mobile-users', kwargs={'action': 'c'}), '/mobile-users/c')

        self.assertEqual(reverse('kernel-proxy-root'), '/api/kernel/')
        self.assertEqual(reverse('odk-proxy-root'), '/api/odk/')
        self.assertEqual(reverse('couchdb-sync-proxy-root'), '/api/couchdb-sync/')


@override_settings(AETHER_APPS=['aether-kernel'])
class UrlsAetherAppsTest(UrlsTestCase):

    def test__urls__aether(self):
        self.assertEqual(reverse('surveys', kwargs={'action': 'a'}), '/surveys/a/')
        self.assertRaises(exceptions.NoReverseMatch, reverse, 'odk-surveyors')
        self.assertRaises(exceptions.NoReverseMatch, reverse, 'couchdb-sync-mobile-users')
