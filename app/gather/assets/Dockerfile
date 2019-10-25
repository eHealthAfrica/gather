FROM node:lts-slim

ARG VERSION
ARG GIT_REVISION

RUN mkdir -p /var/tmp && \
    echo $VERSION > /var/tmp/VERSION && \
    echo $GIT_REVISION > /var/tmp/REVISION

WORKDIR /code/

COPY ./package.json /code/package.json
RUN npm install -q -g npm && npm install -q

COPY ./ /code

ENTRYPOINT ["/code/conf/entrypoint.sh"]
