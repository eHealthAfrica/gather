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

import sys
from importlib import reload, import_module

from django.conf import settings
from django.test import TestCase, override_settings
from django.urls import reverse, resolve, exceptions, clear_url_caches


class UrlsTestCase(TestCase):

    def setUp(self):
        reload(sys.modules[settings.ROOT_URLCONF])
        import_module(settings.ROOT_URLCONF)
        clear_url_caches()

    def tearDown(self):
        clear_url_caches()


class UrlsTest(UrlsTestCase):

    def test__urls__checks(self):
        self.assertEqual(reverse('health'), '/health')
        self.assertEqual(reverse('check-db'), '/check-db')
        self.assertEqual(reverse('assets-settings'), '/assets-settings')
        self.assertEqual(reverse('admin:index'), '/admin/')

    def test__urls__accounts(self):
        self.assertEqual(reverse('rest_framework:login'), '/accounts/login/')
        self.assertEqual(reverse('rest_framework:logout'), '/accounts/logout/')

    def test__urls__accounts__views(self):
        from django.contrib.auth import views

        self.assertEqual(resolve('/accounts/login/').func.view_class,
                         views.LoginView.as_view().view_class)
        self.assertEqual(resolve('/accounts/logout/').func.view_class,
                         views.LogoutView.as_view().view_class)

    def test__urls__aether(self):
        self.assertEqual(reverse('surveys', kwargs={'action': 'a'}), '/surveys/a/')
        self.assertEqual(reverse('odk-surveyors', kwargs={'action': 'b'}), '/surveyors/b/')
        self.assertEqual(reverse('couchdb-sync-mobile-users', kwargs={'action': 'c'}), '/mobile-users/c')

        self.assertEqual(reverse('api:kernel-proxy-root'), '/api/kernel/')
        self.assertEqual(reverse('api:odk-proxy-root'), '/api/odk/')
        self.assertEqual(reverse('api:couchdb-sync-proxy-root'), '/api/couchdb-sync/')


@override_settings(APP_URL='/gather')
class UrlsAppUrlTest(UrlsTestCase):

    def test__urls__checks(self):
        self.assertEqual(reverse('health'), '/gather/health')
        self.assertEqual(reverse('check-db'), '/gather/check-db')
        self.assertEqual(reverse('assets-settings'), '/gather/assets-settings')
        self.assertEqual(reverse('admin:index'), '/gather/admin/')

    def test__urls__accounts(self):
        self.assertEqual(reverse('rest_framework:login'), '/gather/accounts/login/')
        self.assertEqual(reverse('rest_framework:logout'), '/gather/accounts/logout/')

    def test__urls__aether(self):
        self.assertEqual(reverse('surveys', kwargs={'action': 'a'}), '/gather/surveys/a/')
        self.assertEqual(reverse('odk-surveyors', kwargs={'action': 'b'}), '/gather/surveyors/b/')
        self.assertEqual(reverse('couchdb-sync-mobile-users', kwargs={'action': 'c'}), '/gather/mobile-users/c')

        self.assertEqual(reverse('api:kernel-proxy-root'), '/gather/api/kernel/')
        self.assertEqual(reverse('api:odk-proxy-root'), '/gather/api/odk/')
        self.assertEqual(reverse('api:couchdb-sync-proxy-root'), '/gather/api/couchdb-sync/')


@override_settings(
    CAS_SERVER_URL='http://localhost:6666',
    INSTALLED_APPS=[*settings.INSTALLED_APPS, 'django_cas_ng'],
)
class UrlsCASServerTest(UrlsTestCase):

    def test__urls__accounts(self):
        from django_cas_ng import views

        self.assertEqual(reverse('rest_framework:login'), '/accounts/login/')
        self.assertEqual(reverse('rest_framework:logout'), '/accounts/logout/')

        self.assertEqual(resolve('/accounts/login/').func, views.login)
        self.assertEqual(resolve('/accounts/logout/').func, views.logout)


@override_settings(AETHER_APPS={})
class UrlsAetherAppsTest(UrlsTestCase):

    def test__urls__aether(self):
        self.assertEqual(reverse('surveys', kwargs={'action': 'a'}), '/surveys/a/')
        self.assertRaises(exceptions.NoReverseMatch, reverse, 'odk-surveyors')
        self.assertRaises(exceptions.NoReverseMatch, reverse, 'couchdb-sync-mobile-users')
