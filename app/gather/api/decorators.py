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

import logging

from django.conf import settings
from django.contrib.auth.decorators import user_passes_test

from .models import UserTokens

logger = logging.getLogger(__name__)
logger.setLevel(settings.LOGGING_LEVEL)


def tokens_required(function=None, redirect_field_name=None, login_url=None):
    '''
    Decorator for views that checks that a user is logged in and
    he/she has valid tokens for each app used in the proxy view.
    '''

    def user_token_test(user):
        '''
        Checks for each external app that the user can currently connect to it.
        '''
        try:
            for app in settings.AETHER_APPS:
                # checks if there is a valid token for this app
                if UserTokens.get_or_create_user_app_token(user, app) is None:
                    logger.error(f'Could not check the authorization token for "{user}" in "{app}".')
                    return False
            return True
        except Exception:
            return False

    actual_decorator = user_passes_test(
        lambda u: u.is_authenticated and user_token_test(u),
        login_url=login_url or '/~tokens',
        redirect_field_name=redirect_field_name,
    )
    return actual_decorator(function) if function else actual_decorator
