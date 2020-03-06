################################################################################
## using alpine image to build version and revision files
################################################################################

FROM alpine AS app_resource

WORKDIR /tmp
COPY ./.git /tmp/.git
COPY ./app/conf/docker/setup_revision.sh /tmp/setup_revision.sh
RUN /tmp/setup_revision.sh


################################################################################
## using node image to build react app
################################################################################

FROM node:lts-slim AS app_node

WORKDIR /node/
## copy application version and git revision
COPY --from=app_resource /tmp/resources/. /var/tmp/
## copy source code
COPY ./app/gather/assets/ /node/
## build react app
RUN npm install -q && npm run build


################################################################################
## using python image to build app
################################################################################

FROM python:3.7-slim-buster AS app

LABEL description="Gather 3 > Effortless data collection and curation" \
      name="gather" \
      author="eHealth Africa"

## set up container
WORKDIR /code
ENTRYPOINT ["/code/entrypoint.sh"]

COPY ./app/conf/docker/* /tmp/
RUN /tmp/setup.sh

## copy source code
COPY --chown=gather:gather ./app/ /code/

## install dependencies
RUN pip install -q --upgrade pip && \
    pip install -q -r /code/conf/pip/requirements.txt

## copy react app
RUN rm -Rf /code/gather/assets/
COPY --from=app_node --chown=gather:gather /node/bundles/. /code/gather/assets/bundles

## copy application version and revision
COPY --from=app_resource --chown=gather:gather /tmp/resources/. /var/tmp/
