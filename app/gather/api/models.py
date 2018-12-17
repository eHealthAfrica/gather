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

import uuid
import requests

from collections import namedtuple

from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.translation import ugettext as _

from ..settings import AETHER_APPS

'''

Data model schema:


    +--------------------+
    | UserTokens         |
    +====================+
    | user (User)        |
    | kernel_token       |
    | odk_token          |
    | couchdb_sync_token |
    +--------------------+


    +------------------+       +------------------+
    | Survey / Project |       | Mask             |
    +==================+       +==================+
    | project_id       |<--+   | id               |
    | name             |   |   | name             |
    +------------------+   |   | columns          |
                           |   +::::::::::::::::::+
                           +--<| survey           |
                               +------------------+

'''


'''
Named tuple to pass together the app base url and the user auth token
'''
UserAppToken = namedtuple('UserAppToken', ['base_url', 'token'])


class UserTokens(models.Model):
    '''
    User auth tokens to connect to the different apps.
    '''

    user = models.OneToOneField(
        to=get_user_model(),
        primary_key=True,
        on_delete=models.CASCADE,
        verbose_name=_('user')
    )

    kernel_token = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        verbose_name=_('Aether Kernel token'),
        help_text=_('This token corresponds to an Aether Kernel authorization token linked to this user.'),
    )
    odk_token = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        verbose_name=_('Aether ODK token'),
        help_text=_('This token corresponds to an Aether ODK authorization token linked to this user.'),
    )
    couchdb_sync_token = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        verbose_name=_('Aether CouchDB-Sync token'),
        help_text=_('This token corresponds to an Aether CouchDB-Sync authorization token linked to this user.'),
    )

    def get_app_url(self, app_name):
        '''
        Gets the `url` of the app.
        '''

        if app_name in AETHER_APPS:
            return AETHER_APPS[app_name]['url']

        return None

    def save_app_token(self, app_name, token):
        '''
        Saves the auth `token` of the app.
        '''

        if app_name not in AETHER_APPS:
            return

        app_property = '{}_token'.format(self.__clean_app_name__(app_name))
        setattr(self, app_property, token)
        self.save()

    def get_app_token(self, app_name):
        '''
        Gets the auth `token` of the app.
        '''

        if app_name not in AETHER_APPS:
            return None

        app_property = '{}_token'.format(self.__clean_app_name__(app_name))
        return getattr(self, app_property)

    def create_app_token(self, app_name):
        '''
        Creates a new auth `token` of the app.
        '''

        if app_name not in AETHER_APPS:
            return None

        # obtain it from app server
        token = self.obtain_app_token(app_name)
        self.save_app_token(app_name, token)
        return self.get_app_token(app_name)

    def get_or_create_app_token(self, app_name):
        '''
        Gets the auth `token` of the app. If it does not exist yet, it's created.
        '''

        if app_name not in AETHER_APPS:
            return None

        token = self.get_app_token(app_name)
        if token is None:
            token = self.create_app_token(app_name)
        return token

    def obtain_app_token(self, app_name):
        '''
        Gets the auth `token` of the app from the app itself.
        '''

        if app_name not in AETHER_APPS:
            return None
        base_url = self.get_app_url(app_name)
        auxiliary_token = AETHER_APPS[app_name]['token']

        response = requests.post(
            '{}/accounts/token'.format(base_url),
            data={'username': self.user.username},
            headers={'Authorization': 'Token {token}'.format(token=auxiliary_token)},
        )

        if response.status_code == 200:
            return response.json()['token']

        return None

    def validates_app_token(self, app_name):
        '''
        Checks if with the current auth `token` it's possible to connect to the app server.
        '''

        if app_name not in AETHER_APPS:
            return False
        base_url = self.get_app_url(app_name)
        token = self.get_app_token(app_name)
        if token is None:
            return False

        response = requests.get(
            base_url,
            headers={'Authorization': 'Token {token}'.format(token=token)},
        )
        return response.status_code == 200

    def __clean_app_name__(self, app_name):
        return app_name.replace('-', '_')

    @classmethod
    def get_or_create_user_app_token(cls, user, app_name):
        '''
        Gets the user auth token to connect to the app, checking first if it's valid.
        '''

        if app_name not in AETHER_APPS:
            return None

        user_tokens, _ = cls.objects.get_or_create(user=user)
        base_url = user_tokens.get_app_url(app_name)

        # if the current auth token is not valid then obtain a new one from app server
        if not user_tokens.validates_app_token(app_name):
            token = user_tokens.create_app_token(app_name)
        else:
            token = user_tokens.get_app_token(app_name)

        if token is None:
            return None

        return UserAppToken(base_url=base_url, token=token)

    class Meta:
        app_label = 'gather'
        default_related_name = 'app_tokens'
        verbose_name = _('user authorization tokens')
        verbose_name_plural = _('users authorization tokens')


class Survey(models.Model):
    '''
    Database link of a Aether Kernel Project
    '''

    # This is needed to match data with kernel
    # (there is a one to one relation)
    project_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        verbose_name=_('project ID'),
        help_text=_('This ID corresponds to an Aether Kernel project ID.'),
    )
    name = models.TextField(null=True, blank=True, default='', verbose_name=_('name'))

    @property
    def survey_id(self):
        return self.project_id or ''

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'gather'
        default_related_name = 'surveys'
        verbose_name = _('survey')
        verbose_name_plural = _('surveys')


class Mask(models.Model):
    '''
    Survey entities mask.

    Indicates the entity columns to display in all views and downloads.
    '''

    survey = models.ForeignKey(to=Survey, on_delete=models.CASCADE, verbose_name=_('survey'))

    name = models.TextField(verbose_name=_('name'))
    columns = ArrayField(
        base_field=models.TextField(verbose_name=_('column internal name')),
        verbose_name=_('masked columns'),
        help_text=_('Comma separated list of column internal names')
    )

    def __str__(self):
        return '{} - {}'.format(str(self.survey), self.name)

    class Meta:
        app_label = 'gather'
        default_related_name = 'masks'
        unique_together = ('survey', 'name')
        verbose_name = _('mask')
        verbose_name_plural = _('masks')
