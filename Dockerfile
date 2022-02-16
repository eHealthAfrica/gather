FROM python:3.8-slim-bullseye

LABEL description="Gather 3 > Effortless data collection and curation" \
      name="gather" \
      author="eHealth Africa"

################################################################################
## set up container
################################################################################

COPY ./app/conf/docker/* /tmp/
RUN /tmp/setup.sh

WORKDIR /code
ENTRYPOINT ["/code/entrypoint.sh"]

################################################################################
## install dependencies
## copy files one by one and split commands to use docker cache
################################################################################

COPY --chown=gather:gather ./app/conf/pip /code/conf/pip

ENV VIRTUAL_ENV=/var/run/gather/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN mkdir -p $VIRTUAL_ENV && \
    python3 -m venv $VIRTUAL_ENV && \
    pip install -q --upgrade pip && \
    pip install -q -r /code/conf/pip/requirements.txt
COPY --chown=gather:gather ./app /code

################################################################################
## create application version and revision files
################################################################################

ARG VERSION=0.0.0
ARG GIT_REVISION

RUN mkdir -p /var/tmp && \
    echo $VERSION > /var/tmp/VERSION && \
    echo $GIT_REVISION > /var/tmp/REVISION
