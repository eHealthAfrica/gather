FROM node:14-alpine

WORKDIR /code/
ENTRYPOINT ["/code/assets/conf/entrypoint.sh"]

ARG VERSION
ARG GIT_REVISION

RUN mkdir -p /var/tmp && \
    echo $VERSION > /var/tmp/VERSION && \
    echo $GIT_REVISION > /var/tmp/REVISION

COPY ./package.json /code/package.json
RUN apk add -q --no-cache --update bash && \
    npm install -s --no-audit --no-fund --no-package-lock && \
    npm cache clean --force

ENV PATH /code/node_modules/.bin:$PATH

WORKDIR /code/assets
COPY ./ /code/assets

USER node
