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

from django.conf import settings
from django.test import TestCase


class SettingsTest(TestCase):

    def test_default_variables(self):

        self.assertTrue(settings.MULTITENANCY)
        self.assertTrue(settings.TESTING)
        self.assertFalse(settings.DEBUG)

        self.assertFalse(settings.STORAGE_REQUIRED)
        self.assertFalse(settings.SCHEDULER_REQUIRED)
        self.assertTrue(settings.WEBPACK_REQUIRED)

        self.assertEqual(settings.APP_MODULE, 'gather')
        self.assertEqual(settings.ROOT_URLCONF, 'gather.urls')

        self.assertTrue(settings.TESTING)
        self.assertFalse(settings.DEBUG)

        self.assertEqual(settings.APP_NAME, 'Gather')
        self.assertEqual(settings.INSTANCE_NAME, 'Gather 3')

        self.assertIn('kernel', settings.AETHER_APPS)
        self.assertEqual(settings.AETHER_APPS['kernel']['url'], 'http://kernel-test')

        self.assertIn('odk', settings.AETHER_APPS)
        self.assertEqual(settings.AETHER_APPS['odk']['url'], 'http://odk-test')

        self.assertIn('couchdb-sync', settings.AETHER_APPS)
        self.assertEqual(settings.AETHER_APPS['couchdb-sync']['url'], 'http://couchdb-sync-test')
