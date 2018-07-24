# Gather

> Survey collection and analytics

## Table of contents

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
- [Setup](#Setup)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
    - [Gather](#gather)
- [Usage](#usage)
  - [Users & Authentication](#users--authentication)
    - [Token Authentication](#token-authentication)
- [Development](#development)
  - [Frontend assets](#frontend-assets)
- [Containers and services](#containers-and-services)
- [Run commands in the containers](#run-commands-in-the-containers)
  - [Run tests](#run-tests)
  - [Upgrade python dependencies](#upgrade-python-dependencies)
    - [Check outdated dependencies](#check-outdated-dependencies)
    - [Update requirements file](#update-requirements-file)


## Introduction

Gather is an ODK-compatible data collection tool. It is built on top of the [Aether framework](https://aether.ehealthafrica.org). If you want to try it out, the easiest way is to follow the [instructions](https://gather.ehealthafrica.org/documentation/try/) on the [Gather microsite](https://gather.ehealthafrica.org).

## Setup

### Dependencies

- git
- [docker-compose](https://docs.docker.com/compose/)
- Permission to the eHealthAfrica DockerHub repository - contact eHA DevOps

*[Return to TOC](#table-of-contents)*

### Installation

```bash
git clone git@github.com:eHealthAfrica/gather.git
cd gather

docker-compose build
```

Include this entry in your `/etc/hosts` file:

```
127.0.0.1    kernel.aether.local odk.aether.local ui.aether.local gather.local
```

*[Return to TOC](#table-of-contents)*

### Environment Variables

Most of the environment variables are set to default values. This is the short list
of the most common ones with non default values. For more info take a look at the file
[docker-compose-base.yml](docker-compose-base.yml)


#### Gather

- Gather specific:
  - `INSTANCE_NAME`: `Gather 3` identifies the current instance among others.

- CSV export:
  - `CSV_MAX_ROWS_SIZE`: `1048575` indicates the maximum number of rows to include in the CSV file.
  - `CSV_HEADER_RULES`: `remove-prefix;payload.,remove-prefix;None.,replace;.;:;`
    CSV header labels parser rules, transforms header from `payload.None.a.b.c` to `a:b:c`.
    Default rules are `remove-prefix;payload.,remove-prefix;None.,`, removes `payload.None.` prefixes.
  - `CSV_HEADER_RULES_SEP`: `;` rules divider. Default `:`. Include it if any of the rules uses `:`.
    See more in `aether.common.drf.renderers.CustomCSVRenderer`.

- Authentication (Central Authentication Service):
  - `CAS_SERVER_URL`: `https://your.cas.server`.
  - `HOSTNAME`: `gather.local`.

- Django specific:
  - `ADMIN_PASSWORD`: `secresecret` the setup script will create the superuser
    "admin-gather" with this password. There is no default value.
  - `DJANGO_SECRET_KEY`: `any_long_and_secret_key_you_can_imagine`.
    See more in [Django settings](https://docs.djangoproject.com/en/2.0/ref/settings/#std:setting-SECRET_KEY)
  - `RDS_DB_NAME`: `gather` Postgres database name.
  - `WEB_SERVER_PORT`: `8005` Web server port.

- Aether specific:
  - `AETHER_MODULES`: `odk,` Comma separated list with the available modules.
    To avoid confusion, the values will match the container name, `odk`.

  - Aether Kernel:
    - `AETHER_KERNEL_TOKEN`: `aether_kernel_admin_user_auth_token`
      Token to connect to Aether Kernel Server.
    - `AETHER_KERNEL_URL`: `http://kernel:8000` Aether Kernel Server url.
    - `AETHER_KERNEL_URL_TEST`: `http://kernel-test:9000` Aether Kernel Testing Server url.
    - `AETHER_KERNEL_URL_ASSETS`: `http://kernel.aether.local` Aether Kernel url used in NGINX.
      This url is being used in the frontend to display the linked attachment files
      served by NGINX. Defaults to `AETHER_KERNEL_URL` value.

  - Aether ODK:
    - `AETHER_ODK_TOKEN`: `aether_odk_admin_user_auth_token`
      Token to connect to Aether ODK Server.
    - `AETHER_ODK_URL`: `http://odk:8002` Aether ODK Server url.
    - `AETHER_ODK_URL_TEST`: `http://odk-test:9002` Aether ODK Testing Server url.
    - `AETHER_ODK_URL_ASSETS`: `http://odk.aether.local` Aether ODK url used in NGINX.
      This url is being used in the frontend to display the linked media files
      served by NGINX. Defaults to `AETHER_ODK_URL` value.


##### AETHER_XXX_URL vs AETHER_XXX_URL_ASSETS

The difference between these two variables is quite obscure.
If we are using docker-compose and running the containers together,
the first one is the container name with the port, `http://kernel:8000`, and the
second one is the one provided by NGINX, using the network name, and serves the
protected media, `http://kernel.aether.local`.
For an unexpected reason `gather` container cannot communicate with
`kernel` container using the network name.
If we are running the containers separately (with kubernetes, in AWS...)
both urls are external to the gather container and should be the same.


## Usage

```bash
docker-compose up --build    # this will update the cointainers if needed
```

This will start:

- **gather** on `http://gather.local:8005`
  and create a superuser `${ADMIN_USERNAME}`.

- **gather-assets** on `http://localhost:3005`
  only needed for HMR during assets development (`/app/gather/assets/`).

- **aether-kernel** on `http://kernel.aether.local:8000`
  and create a superuser `admin` with the needed TOKEN.

- **aether-odk** on `http://odk.aether.local:8002`
  and create a superuser `admin` with the needed TOKEN.

- **aether-ui** on `http://ui.aether.local:8004`
  and create a superuser `admin` with the needed TOKEN.

All the created superusers have password `${ADMIN_PASSWORD}` in each container.

If the `nginx` container is also started the url ports can be removed.
- `http://gather.local`
- `http://kernel.aether.local`
- `http://odk.aether.local`
- `http://odk.aether.local:8443` This is required by ODK Collect
- `http://ui.aether.local`


*[Return to TOC](#table-of-contents)*

### Users & Authentication

Set the `HOSTNAME` and `CAS_SERVER_URL` environment variables if you want to
activate the CAS integration in the app.
See more in [Django CAS client](https://github.com/mingchen/django-cas-ng).

The other option is the standard django authentication.

*[Return to TOC](#table-of-contents)*

#### Token Authentication

The communication with the Aether servers is done via
[token authentication](http://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication).

In `gather` there are tokens per user to connect to other servers.
This means that every time a logged in user tries to visit any page that requires
to fetch data from any of the other apps, `aether-kernel` and/or `aether-odk`,
the system will verify that the user token for that app is valid or will request
a new one using the global tokens, `AETHER_KERNEL_TOKEN` and/or `AETHER_ODK_TOKEN`;
that token is going to be used for all requests and will allow the system to better
track the user actions.

*[Return to TOC](#table-of-contents)*


## Development

All development should be tested within the container, but developed in the host folder.
Read the [docker-compose-base.yml](docker-compose-base.yml) file to see how it's mounted.

If you want to develop with your local Aether images use the file
[docker-compose-local.yml](docker-compose-local.yml) and change the container
paths to your current paths.

```bash
docker-compose -f docker-compose-local.yml up
```

*[Return to TOC](#table-of-contents)*


### Frontend assets

Frontend assets include JS, CSS, and fonts. They are all handled by webpack.

See more in [Assets README](app/gather/assets/README.md)

*[Return to TOC](#table-of-contents)*


## Containers and services

The list of the main containers:


| Container         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| db                | [PostgreSQL](https://www.postgresql.org/) database                |
| **gather**        | Gather app                                                        |
| **gather-assets** | Gather Assets HRM module                                          |
| **kernel**        | Aether Kernel app                                                 |
| **odk**           | Aether ODK Collect Adapter app (imports data from ODK Collect)    |
| **ui**            | Aether Kernel UI (only needed for advanced mapping functionality) |
| kernel-test       | Aether Kernel TESTING app (used only in e2e testss)               |
| odk-test          | Aether ODK TESTING app (used only in e2e testss)                  |


All of the containers definition for development can be found in the
[docker-compose-base.yml](docker-compose-base.yml) file.

*[Return to TOC](#table-of-contents)*


## Run commands in the containers

The [entrypoint.sh](app/entrypoint.sh)
script offers a range of commands to start services or run commands.
The full list of commands can be seen in the script file.

The pattern to run a command is always
``docker-compose run <container-name> <entrypoint-command> <...args>``

*[Return to TOC](#table-of-contents)*


### Run tests

This will stop ALL running containers and execute `gather` tests.

```bash
./scripts/test_gather.sh
```

or

```bash
docker-compose run gather test
docker-compose run gather-assets test
```

or

```bash
docker-compose run gather test_lint
docker-compose run gather test_coverage

docker-compose run gather-assets test_lint
docker-compose run gather-assets test_js
```

The e2e tests are run against different containers, the config file used
for them is [docker-compose-test.yml](docker-compose-test.yml).

Before running `gather` tests you should start the dependencies test containers.

```bash
docker-compose -f docker-compose-test.yml up -d <container-name>-test
```

**WARNING**

Never run `gather` tests against any PRODUCTION server.
The tests clean up could **DELETE ALL PROJECTS!!!**

Look into [docker-compose-base.yml](docker-compose-base.yml), the variable
`AETHER_KERNEL_URL_TEST` indicates the Aether Kernel Server used in tests.

*[Return to TOC](#table-of-contents)*


### Upgrade python dependencies

#### Check outdated dependencies

```bash
docker-compose run gather eval pip list --outdated
```

#### Update requirements file

```bash
docker-compose run gather pip_freeze
```

*[Return to TOC](#table-of-contents)*
