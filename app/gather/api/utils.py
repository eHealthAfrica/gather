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

import logging
import os
from requests.exceptions import HTTPError
from aether.sdk.utils import request
from django.utils.translation import gettext as _

LOG = logging.getLogger('Utils')


def consumer_request(url='', method='get', data=None, headers={}):
    '''
    Handle request calls to a consumer
    '''
    headers['content-type'] = 'application/json'
    res = request(
        method=method,
        url=url,
        json=data or {},
        headers=headers,
    )
    try:
        res.raise_for_status()
    except HTTPError as e:
        LOG.debug(str(e))
        raise e
    try:
        return res.json()
    except Exception:
        return res.content


def upsert_resource(base_url, resource_name, resource, headers={}, skip_subs=False):
    '''
    Upsert consumer resources
    '''
    _resource_id = resource.get('id')
    if _resource_id:
        try:
            _existing_resource = consumer_request(
                url=f'{base_url}{resource_name}/list',
                headers=headers
            )
            _method = f'update?id={_resource_id}' if _resource_id in _existing_resource else 'add'
            url = f'{base_url}{resource_name}/{_method}'

            if resource_name == 'job' and _method != 'add' and not skip_subs:
                _existing_job = consumer_request(
                    url=f'{base_url}job/get?id={_resource_id}',
                    headers=headers
                )
                old_subs = _existing_job.get('subscription', [])
                new_subs = list(set(old_subs + resource['subscription']))
                resource['subscription'] = new_subs

            return consumer_request(
                url=url,
                method='post',
                headers=headers,
                data=resource
            )
        except Exception as e:
            LOG.debug(str(e))
            raise e
    else:
        err = f'{resource_name}: {_("No id provided")}'
        LOG.debug(err)
        raise Exception(err)


def __clean_name(value):
    '''
    Replaces any non alphanumeric character with spaces
    Converts to title case
    Removes spaces
    '''
    return ''.join([c if c.isalnum() or c == '_' else ' ' for c in value]).title().replace(' ', '')


def configure_consumers(consumer_settings, survey_name, realm, headers={}):
    '''
    Creates or updates consumer resources
    Add a subscription to a topic as the survey name

    Returns list of consumers configured and list of errors if any
    '''

    cons_errors = []
    cons = []
    consumer_env_variables = {}
    survey_name = __clean_name(survey_name)

    for consumer in consumer_settings:
        if not consumer.keys() >= {'resources', 'subscription', 'job', 'url', 'name'}:
            cons_errors += [
                {consumer.get('name', 'Unknown'): _('Invalid config settings')}
            ]
            continue

        consumer_name = consumer.get('name')
        consumer_url = consumer.get('url')
        consumer_resources = consumer.get('resources')
        job_data = {}
        consumer_env_variables[consumer_name] = get_env_variables(consumer_name)

        # check if consumer is online
        try:
            consumer_request(url=f'{consumer_url}health', headers=headers)
        except Exception as e:
            cons_errors += [
                {consumer_name: _('Consumer is offline')}
            ]
            LOG.error(str({consumer_name: f'{_("Consumer is offline @")} {consumer_url}, error: {str(e)}'}))
            continue

        # register resources (upsert)
        for resource in consumer_resources.keys():
            _cons_res = consumer_resources[resource]
            _resource_id = _cons_res.get('id', f'{resource}-id')
            _cons_res.update(get_resource_env(consumer_env_variables, consumer_name, resource))
            try:
                upsert_resource(consumer_url, resource, _cons_res, headers)
                job_data[resource] = _resource_id
            except Exception as e:
                cons_errors += [
                    {consumer_name: f'resources: {resource}: {str(e)}'}
                ]
                LOG.debug(str(e))

        # register subscription
        _sub_resource = 'subscription'
        _cons_sub = consumer.get(_sub_resource)
        _resource_id = f'{realm}-{survey_name.lower()}-{_sub_resource}-id'
        _cons_sub['id'] = _resource_id
        _cons_sub['topic_pattern'] = f'{survey_name}*'
        try:
            upsert_resource(consumer_url, _sub_resource, _cons_sub, headers)
            job_data[_sub_resource] = [_resource_id]
        except Exception as e:
            cons_errors += [
                {consumer_name: f'{_sub_resource}: {str(e)}'}
            ]
            LOG.debug(str(e))

        # register job
        _resource = 'job'
        _cons_job = consumer.get(_resource)
        job_data['id'] = _cons_job.get('id', f'{_resource}-id')
        job_data['name'] = _cons_job.get('name', 'Gather Job')
        try:
            upsert_resource(consumer_url, _resource, job_data, headers)
        except Exception as e:
            cons_errors += [
                {consumer_name: f'{_resource}: {str(e)}'}
            ]
            LOG.debug(str(e))
        cons.append(consumer_name)

    return cons, cons_errors


def delete_survey_subscription(consumer_settings, survey_name, realm, headers={}):
    '''
    Removes survey subscriptions from all jobs
    Deletes jobs if subscriptions are empty
    '''

    _survey_name = __clean_name(survey_name)
    _errors = []
    _subscription_key = 'subscription'

    for consumer in consumer_settings:
        consumer_name = consumer.get('name')
        consumer_url = consumer.get('url')
        try:
            survey_subscription_id = f'{realm}-{_survey_name.lower()}-{_subscription_key}-id'
            jobs = consumer_request(
                url=f'{consumer_url}job/list',
                headers=headers
            )
            for job in jobs:
                job_data = consumer_request(
                    url=f'{consumer_url}job/get?id={job}',
                    headers=headers
                )
                if survey_subscription_id in job_data[_subscription_key]:
                    job_data[_subscription_key].remove(survey_subscription_id)
                if job_data[_subscription_key]:
                    # update job with reduced subscription
                    upsert_resource(consumer_url, 'job', job_data, headers, True)
                else:
                    # delete job if subscription is empty
                    delete_url = f'{consumer_url}job/delete?id={job}'
                    consumer_request(
                        url=delete_url,
                        headers=headers
                    )
            # delete subscription
            delete_url = f'{consumer_url}{_subscription_key}/delete?id={survey_subscription_id}'
            consumer_request(
                url=delete_url,
                headers=headers
            )
        except Exception as e:
            _errors += [{
                consumer_name: f'job: {str(e)}'
            }]
            LOG.debug(str(e))
    return _errors


def get_env_variables(consumer):
    '''
    Gets consumer variables from environment variables
    Search format: CONSUMER_*
    '''
    key_word = f'{consumer.lower()}_'
    consumer_variables = {
        v: os.environ[v]
        for v in os.environ
        if v.lower().startswith(key_word)
    }
    return consumer_variables


def get_resource_env(consumer_variables, consumer, resource):
    '''
    Gets resource variables from consumer variables
    Search format: CONSUMER_*
    '''
    key_word = f'{consumer.lower()}_{resource.lower()}_'
    resource_variables = {
        v.replace(key_word, ''): consumer_variables[v]
        for v in consumer_variables
        if v.lower().startswith(key_word)
    }
    return resource_variables
