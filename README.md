# Gather

> Effortless data collection and curation

## Table of contents

- [Table of contents](#table-of-contents)
- [Introduction](#introduction)
- [Setup](#Setup)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
    - [Gather instance](#gather-instance)
- [Usage](#usage)
  - [Users & Authentication](#users--authentication)
    - [Token Authentication](#token-authentication)
- [Development](#development)
  - [Frontend assets](#frontend-assets)
- [Containers and services](#containers-and-services)
- [Run commands in the containers](#run-commands-in-the-containers)
  - [Python container](#python-container)
  - [Node container](#node-container)
  - [Run tests](#run-tests)
  - [Upgrade python dependencies](#upgrade-python-dependencies)
    - [Check outdated dependencies](#check-outdated-dependencies)
    - [Update requirements file](#update-requirements-file)


## Introduction

Gather is an ODK-compatible data collection tool.
It is built on top of the [Aether framework](https://aether.ehealthafrica.org).
If you want to try it out, the easiest way is to follow the
[instructions](https://gather.ehealthafrica.org/documentation/try/)
on the [Gather microsite](https://gather.ehealthafrica.org).


## Setup

### Dependencies

- git
- [docker-compose](https://docs.docker.com/compose/)

*[Return to TOC](#table-of-contents)*

### Installation

```bash
git clone git@github.com:eHealthAfrica/gather.git
cd gather
```

*[Return to TOC](#table-of-contents)*

#### Build containers

```bash
./scripts/prepare-containers.sh
```

**IMPORTANT NOTE**: the docker-compose files are intended to be used exclusively
for local development. Never deploy these to publicly accessible servers.

*[Return to TOC](#table-of-contents)*

#### Include this entry in your `/etc/hosts` or `C:\Windows\System32\Drivers\etc\hosts` file

```text
# gather
127.0.0.1    gather.local

# aether
127.0.0.1    kernel.aether.local odk.aether.local sync.aether.local ui.aether.local
```

*[Return to TOC](#table-of-contents)*

#### Generate credentials for local development with docker-compose

**Note:** Make sure you have `openssl` installed in your system.

```bash
./scripts/generate-credentials.sh > .env
```

This instruction is included in the `./scripts/prepare-containers.sh` script.

*[Return to TOC](#table-of-contents)*


### Environment Variables

Most of the environment variables are set to default values. This is the short list
of the most common ones with non default values. For more info take a look at the files
[docker-compose-base.yml](docker-compose-base.yml) and
[/scripts/generate-credentials.sh](/scripts/generate-credentials.sh).

See also [Django settings](https://docs.djangoproject.com/en/2.1/ref/settings/).

#### Gather instance

- Gather specific:
  - `INSTANCE_NAME`: `Gather 3` identifies the current instance among others.

- Data export:
  - `EXPORT_FORMAT`: `csv` the default export format. Possible values: `xlsx` or `csv`.
  - `EXPORT_MAX_ROWS_SIZE`: between `0` and `1048575` indicates the maximum
    number of rows to include in the export file.
    The limit is an [Excel 2007 restriction](https://support.office.com/en-us/article/Excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3).

- Authentication (Central Authentication Service):
  - `CAS_SERVER_URL`: `https://your.cas.server`.
  - `HOSTNAME`: `gather.local`.
  See more in [Django CAS client](https://github.com/mingchen/django-cas-ng).

- Authentication (Django templates):
  - `LOGIN_TEMPLATE`: `pages/login.html`.
  - `LOGGED_OUT_TEMPLATE`: `pages/logged_out.html`.


- Django specific:
  - `ADMIN_USERNAME`: `admin` the setup script will create a superuser
    with this username. There is no default value.
  - `ADMIN_PASSWORD`: `secresecret` the setup script will create the superuser
    with this password. There is no default value.
  - `DB_NAME`: `gather` Postgres database name.
  - `WEB_SERVER_PORT`: `8105` Web server port.

- Aether specific:
  - `AETHER_MODULES`: `odk,couchdb-sync` Comma separated list with the available modules.
    To avoid confusion, the values will match the container name, `odk`, `couchdb-sync`.

  - Aether Kernel:
    - `AETHER_KERNEL_TOKEN`: `aether_kernel_admin_user_auth_token`
      Token to connect to Aether Kernel Server.
    - `AETHER_KERNEL_URL`: `http://kernel:8100` Aether Kernel Server url.
    - `AETHER_KERNEL_URL_TEST`: `http://kernel-test:9100` Aether Kernel Testing Server url.
    - `AETHER_KERNEL_URL_ASSETS`: `http://kernel.aether.local` Aether Kernel url used in NGINX.
      This url is being used in the frontend to display the linked attachment files
      served by NGINX. Defaults to `AETHER_KERNEL_URL` value.

  - Aether ODK:
    - `AETHER_ODK_TOKEN`: `aether_odk_admin_user_auth_token`
      Token to connect to Aether ODK Server.
    - `AETHER_ODK_URL`: `http://odk:8102` Aether ODK Server url.
    - `AETHER_ODK_URL_TEST`: `http://odk-test:9102` Aether ODK Testing Server url.
    - `AETHER_ODK_URL_ASSETS`: `http://odk.aether.local` Aether ODK url used in NGINX.
      This url is being used in the frontend to display the linked media files
      served by NGINX. Defaults to `AETHER_ODK_URL` value.

  - Aether CouchDB Sync:
    - `AETHER_COUCHDB_SYNC_TOKEN`: `aether_couchdb_sync_admin_user_auth_token`
      Token to connect to Aether ODK Server.
    - `AETHER_COUCHDB_SYNC_URL`: `http://sync:8106` Aether CouchDB Sync Server url.
    - `AETHER_COUCHDB_SYNC_URL_TEST`: `http://sync-test:9106` Aether CouchDB Sync Testing Server url.
    - `AETHER_COUCHDB_SYNC_URL_ASSETS`: `http://sync.aether.local` Aether CouchDB Sync url used in NGINX.

*[Return to TOC](#table-of-contents)*


##### AETHER_XXX_URL vs AETHER_XXX_URL_ASSETS

The difference between these two variables is quite obscure.
If we are using docker-compose and running the containers together,
the first one is the container name with the port, `http://kernel:8100`, and the
second one is the one provided by NGINX, using the network name, and serves the
protected media, `http://kernel.aether.local`.
For an unexpected reason `gather` container cannot communicate with
`kernel` container using the network name.
If we are running the containers separately (with kubernetes, in AWS...)
both urls are external to the gather container and should be the same.

*[Return to TOC](#table-of-contents)*


## Usage

```bash
docker-compose up
```

This will start:

- **gather** on `http://gather.local:8105`
  and create a superuser.

- **gather-assets** on `http://localhost:3005`
  only needed for HMR during assets development (`/app/gather/assets/`).

- **aether-kernel** on `http://kernel.aether.local:8100`
  and create a superuser with the needed TOKEN.

- **aether-odk** on `http://odk.aether.local:8102`
  and create a superuser with the needed TOKEN.

- **aether-couchdb-sync** on `http://sync.aether.local:8106`
  and create a superuser with the needed TOKEN.

- **aether-ui** on `http://ui.aether.local:8104`
  and create a superuser.

All the created superusers have username `${ADMIN_USERNAME}` and
password `${ADMIN_PASSWORD}` in each container.

If the `nginx` container is also started then the url ports can be removed.
- `http://gather.local`
- `http://kernel.aether.local`
- `http://odk.aether.local`
- `http://odk.aether.local:8443` This is required by ODK Collect
- `http://sync.aether.local`
- `http://ui.aether.local`

*[Return to TOC](#table-of-contents)*


### Users & Authentication

Set the `HOSTNAME` and `CAS_SERVER_URL` environment variables if you want to
activate the CAS integration in the app.
See more in [Django CAS client](https://github.com/mingchen/django-cas-ng).

The other option is the standard django authentication.

You can indicate your own login and logged out pages with these environment
variables:

- `LOGIN_TEMPLATE`: `pages/login.html`.
- `LOGGED_OUT_TEMPLATE`: `pages/logged_out.html`.

*[Return to TOC](#table-of-contents)*


#### Token Authentication

The communication with the Aether servers is done via
[token authentication](http://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication).

In `gather` there are tokens per user to connect to other servers.
This means that every time a logged in user tries to visit any page that requires
to fetch data from any of the other apps, `aether-kernel`, `aether-odk`, `aether-couchdb-sync`,
the system will verify that the user token for that app is valid or will request
a new one using the global token, `AETHER_<<APP>>_TOKEN`;
the user token is going to be used for all requests and will allow the system to
track better the user actions.

**Warning**: The global `AETHER_<<APP>>_TOKEN` needs to belong to an admin user,
because only those users can create new users with tokens in the Aether apps.

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
| **couchdb-sync**  | Aether CouchDB Sync app (imports data from Aether Mobile App)     |
| **ui**            | Aether Kernel UI (only needed for advanced mapping functionality) |
| kernel-test       | Aether Kernel TESTING app (used only in e2e tests)                |
| odk-test          | Aether ODK TESTING app (used only in e2e tests)                   |
| couchdb-sync-test | Aether CouchDB Sync TESTING app (used only in e2e tests)          |


All the containers definition for development can be found in the
[docker-compose-base.yml](docker-compose-base.yml) file.

*[Return to TOC](#table-of-contents)*


## Run commands in the containers

The pattern to run a command is always

```bash
docker-compose run [--no-deps] <container-name> <entrypoint-command> <...args>
```

If there is no interaction with any other container then include the option `--no-deps`.

See more in [docker-compose run](https://docs.docker.com/compose/reference/run).

*[Return to TOC](#table-of-contents)*


### Python container

The [app/entrypoint.sh](app/entrypoint.sh) script offers a range of commands
to start services or run commands.
The full list of commands can be seen in the script file.

The following are some examples:

| Action                                     | Command                                              |
| ------------------------------------------ | ---------------------------------------------------- |
| List predefined commands                   | `docker-compose run gather help`                     |
| Run tests                                  | `docker-compose run gather test`                     |
| Run code style tests                       | `docker-compose run gather test_lint`                |
| Run python tests                           | `docker-compose run gather test_coverage`            |
| Create a shell inside the container        | `docker-compose run gather bash`                     |
| Execute shell command inside the container | `docker-compose run gather eval <command>`           |
| Run django manage.py                       | `docker-compose run gather manage help`              |
| Create a python shell                      | `docker-compose run gather manage shell`             |
| Create a postgresql shell                  | `docker-compose run gather manage dbshell`           |
| Show ORM migrations                        | `docker-compose run gather manage showmigrations`    |
| Create pending ORM migration files         | `docker-compose run gather manage makemigrations`    |
| Apply pending ORM migrations               | `docker-compose run gather manage migrate`           |
| Check outdated python libraries            | `docker-compose run gather eval pip list --outdated` |
| Update outdated python libraries           | `docker-compose run gather pip_freeze`               |
| Start django development server            | `docker-compose run gather start_dev`                |
| Start uwsgi server                         | `docker-compose run gather start`                    |

*[Return to TOC](#table-of-contents)*


### Node container

The [app/gather/assets/conf/entrypoint.sh](app/gather/assets/conf/entrypoint.sh)
script offers a range of commands to start services or run commands.
The full list of commands can be seen in the script file.

The following are some examples:

| Action                                     | Command                                           |
| ------------------------------------------ | ------------------------------------------------- |
| List predefined commands                   | `docker-compose run gather-assets help`           |
| Run tests                                  | `docker-compose run gather-assets test`           |
| Run code style tests                       | `docker-compose run gather-assets test_lint`      |
| Run JS tests                               | `docker-compose run gather-assets test_js`        |
| Create a shell inside the container        | `docker-compose run gather-assets bash`           |
| Execute shell command inside the container | `docker-compose run gather-assets eval <command>` |
| Build assets used in the Django app        | `docker-compose run gather-assets build`          |
| Start webpack server with HRM              | `docker-compose run gather-assets start_dev`      |

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
The tests would create random users with tokens in the different apps.

Look into [docker-compose-base.yml](docker-compose-base.yml), the variable
`AETHER_<<APP>>_URL_TEST` indicates the Aether Server used in tests.

*[Return to TOC](#table-of-contents)*


### Upgrade python dependencies

#### Check outdated dependencies

```bash
docker-compose run --no-deps gather eval pip list --outdated
```

#### Update requirements file

```bash
docker-compose run --no-deps gather pip_freeze
```

*[Return to TOC](#table-of-contents)*
