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

import requests

from datetime import datetime

from django.http import HttpResponse
from django.utils.translation import ugettext as _
from django.views import View

from rest_framework import viewsets

from ..settings import AETHER_APPS, TESTING
from . import models, serializers


class TokenProxyView(View):
    '''
    This view will proxy any request to the indicated app with the user auth token.
    '''

    app_name = None
    '''
    The app that the proxy should forward requests to.
    '''

    def dispatch(self, request, path='', *args, **kwargs):
        '''
        Dispatches the request including/modifying the needed properties
        '''

        if self.app_name not in AETHER_APPS:
            err = _('"{}" app is not recognized.').format(self.app_name)
            log(err)
            raise RuntimeError(err)

        app_token = models.UserTokens.get_or_create_user_app_token(request.user, self.app_name)
        if app_token is None:
            err = _('User "{}" cannot connect to app "{}"').format(request.user, self.app_name)
            log(err)
            raise RuntimeError(err)

        self.path = path or ''
        self.original_request_path = request.path
        if not self.path.startswith('/'):
            self.path = '/' + self.path

        # build request path with `base_url` + `path`
        url = '{base_url}{path}'.format(base_url=app_token.base_url, path=self.path)

        request.path = url
        request.path_info = url
        request.META['PATH_INFO'] = url
        request.META['HTTP_AUTHORIZATION'] = 'Token {token}'.format(token=app_token.token)

        return super(TokenProxyView, self).dispatch(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.handle(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        return self.handle(request, *args, **kwargs)

    def head(self, request, *args, **kwargs):
        return self.handle(request, *args, **kwargs)

    def options(self, request, *args, **kwargs):
        return self.handle(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.handle(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.handle(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        return self.handle(request, *args, **kwargs)

    def handle(self, request, *args, **kwargs):
        def valid_header(name):
            '''
            Validates if the header can be passed within the request headers.
            '''
            return (
                name.startswith('HTTP_') or
                name.startswith('CSRF_') or
                name == 'CONTENT_TYPE'
            )

        # builds url with the query string
        param_str = request.GET.urlencode()
        url = request.path + ('?{}'.format(param_str) if param_str else '')
        method = request.method

        # builds request headers
        headers = {}
        for header, value in request.META.items():
            # Fixes:
            # django.http.request.RawPostDataException:
            #     You cannot access body after reading from request's data stream
            #
            # Django does not read twice the `request.body` on `POST` calls:
            # but it was already read while checking the CSRF token.
            # This raises an exception in the line below `data=request.body ...`.
            # The Ajax call changed it from `POST` to `PUT`,
            # here it's changed back to its real value.
            #
            # All the conditions are checked to avoid further issues with this.
            if method == 'PUT' and header == 'HTTP_X_METHOD' and value == 'POST':
                method = value

            if valid_header(header):
                # normalize header name
                norm_header = header.replace('HTTP_', '').title().replace('_', '-')
                headers[norm_header] = value

                # nginx also checks HTTP-X-FORWARDED-... headers
                # if not present it changed back to something similar to:
                #    original request:
                #           {https-ui-server}/{app}/{path}?{querystring}
                #    transformed request by this view:
                #           {https-app-server}/{path}?{querystring}
                #    what nginx does afterward:
                #           https://{https-app-server}/{path}?{querystring}
                #    or
                #           {https-ui-server}/{path}?{querystring}
                # obviously, all of them fail and this only happens
                # on the servers with nginx, not locally :(
                if header.startswith('HTTP_X_FORWARDED_'):  # pragma: no cover
                    norm_header = header.title().replace('_', '-')
                    headers[norm_header] = value

        # bugfix: We need to remove the Host from the header
        # since the request goes to another host, otherwise
        # the webserver returns a 404 because the domain is
        # not hosted on that server. The webserver
        # should add the correct Host based on the request.
        # this problem might not be exposed running on localhost
        headers.pop('Host', None)

        log(f'{method}  {url}')
        response = requests.request(method=method,
                                    url=url,
                                    data=request.body if request.body else None,
                                    headers=headers,
                                    *args,
                                    **kwargs)
        http_response = HttpResponse(response, status=response.status_code)
        # copy from the original response headers the exposed ones
        # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers
        # https://fetch.spec.whatwg.org/#http-access-control-expose-headers
        expose_headers = response.headers.get('Access-Control-Expose-Headers', '').split(', ')
        for key in expose_headers:
            if key in response.headers:
                http_response[key] = response.headers.get(key, '')
        return http_response


class SurveyViewSet(viewsets.ModelViewSet):
    '''
    Handle Survey entries.
    '''

    queryset = models.Survey.objects.all()
    serializer_class = serializers.SurveySerializer
    search_fields = ('name',)
    ordering = ('name',)


class MaskViewSet(viewsets.ModelViewSet):
    '''
    Handle Survey Mask entries.
    '''

    queryset = models.Mask.objects.all()
    serializer_class = serializers.MaskSerializer
    search_fields = ('survey__name', 'name', 'columns',)
    ordering = ('survey', 'name',)


def log(message):  # pragma: no cover
    if not TESTING:
        print(f'**** [{datetime.now().isoformat()}] -  {message} ****')
