FROM python:3.7-slim-stretch

################################################################################
## setup container
################################################################################

COPY ./app/conf/docker/* /tmp/
RUN /tmp/setup.sh


################################################################################
## install app
## copy files one by one and split commands to use docker cache
################################################################################

WORKDIR /code

COPY ./app/conf/pip /code/conf/pip
RUN pip install -q --upgrade pip && \
    pip install -q -r /code/conf/pip/requirements.txt

COPY ./app /code


################################################################################
## copy application version and create git revision
################################################################################

ARG VERSION=0.0.0
ARG GIT_REVISION

RUN mkdir -p /var/tmp && \
    echo $VERSION > /var/tmp/VERSION && \
    echo $GIT_REVISION > /var/tmp/REVISION


################################################################################
## last setup steps
################################################################################

RUN chown -R gather: /code

ENTRYPOINT ["/code/entrypoint.sh"]
