FROM python:3.6-slim-jessie

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
RUN pip install -f /code/conf/pip/dependencies -r /code/conf/pip/requirements.txt

COPY ./app /code


################################################################################
## copy application version and create git revision
################################################################################

ARG VERSION
RUN echo $VERSION > VERSION
ARG GIT_REVISION
RUN echo $GIT_REVISION > REVISION


################################################################################
## last setup steps
################################################################################

# create user to run container (avoid root user)
RUN useradd -ms /bin/false gather
RUN chown -R gather: /code

ENTRYPOINT ["/code/entrypoint.sh"]
