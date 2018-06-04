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

import os
import requests

from django.contrib.auth import get_user_model
from django.core.management.base import CommandError
from django.core.management import call_command
from django.test import TestCase

from rest_framework.authtoken.models import Token

from gather.api.models import Project
from gather.management.commands.setup_aether_project import Command

UserModel = get_user_model().objects


def setup_aether_project():
    # Redirect to /dev/null in order to not clutter the test log.
    out = open(os.devnull, 'w')
    call_command('setup_aether_project', stdout=out)


class TestSetupAetherProject(TestCase):

    def delete_aether_project(self, project_id):
        '''
        In order to properly test the management command
        `setup_aether_project`, we need to delete projects in the aether-test
        container.

        This method selectively deletes a single aether project. A more robust
        method would be to delete *all* aether projects in tearDown(), but this
        is obviously more dangerous; if the tests are accidentally run in
        production, we would risk data loss.
        '''
        cmd = Command()
        url = '{projects_url}{project_id}'.format(
            projects_url=cmd.projects_url,
            project_id=project_id,
        )
        response = requests.delete(url=url, headers=cmd.request_headers)
        response.raise_for_status()

    def test__create_aether_project(self):
        setup_aether_project()
        gather_project_id = Project.objects.first().project_id
        self.assertIsNotNone(gather_project_id)
        aether_project_id = Command().get_aether_project(gather_project_id).json()['id']
        self.assertEqual(str(gather_project_id), aether_project_id)
        self.delete_aether_project(aether_project_id)

    def test__check_existing_aether_project(self):
        setup_aether_project()
        gather_project_id_1 = Project.objects.first().project_id
        aether_projects_count_1 = Command().get_aether_projects().json()['count']
        setup_aether_project()
        gather_project_id_2 = Project.objects.first().project_id
        aether_projects_count_2 = Command().get_aether_projects().json()['count']
        self.assertEqual(gather_project_id_1, gather_project_id_2)
        self.assertEqual(aether_projects_count_1, aether_projects_count_2)
        self.delete_aether_project(gather_project_id_1)

    def test__check_existing_aether_project_raises(self):

        def check():
            return Command().check_matching_aether_project('nonexistent')

        self.assertRaises(CommandError, check)


class TestSetupAdmin(TestCase):

    def setUp(self):
        # Redirect to /dev/null in order to not clutter the test log.
        self.out = open(os.devnull, 'w')

    def test__password_argument_is_required(self):
        self.assertRaises(
            CommandError,
            call_command,
            'setup_admin',
            stdout=self.out,
        )

        self.assertRaises(
            CommandError,
            call_command,
            'setup_admin',
            '--username=admin',
            stdout=self.out,
        )

    def test__creates_new_admin_user(self):
        self.assertFalse(UserModel.filter(username='admin_test').exists())
        call_command('setup_admin', '--username=admin_test', '-p=adminadmin', stdout=self.out)
        self.assertTrue(UserModel.filter(username='admin_test').exists())

    def test__updates_existing_user(self):
        user = UserModel.create_user(username='admin', password='adminadmin')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

        call_command('setup_admin', '-p=secretsecret', stdout=self.out)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test__creates_token(self):
        self.assertFalse(UserModel.filter(username='admin').exists())
        self.assertEqual(Token.objects.all().count(), 0)
        call_command('setup_admin', '-p=adminadmin', '-t=12345', stdout=self.out)
        self.assertTrue(UserModel.filter(username='admin').exists())
        self.assertEqual(Token.objects.all().count(), 1)
