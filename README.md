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
  - [Upgrade dependencies](#upgrade-dependencies)
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

#### Include these entries in your `/etc/hosts` or `C:\Windows\System32\Drivers\etc\hosts` file

```text
# gather
127.0.0.1    gather.local

# aether
127.0.0.1    aether.local
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
  - `EXPORT_MAX_ROWS_SIZE`: between `0` and `1048575` indicates the maximum
    number of rows to include in the export file.
    The limit is an [Excel 2007 restriction](https://support.office.com/en-us/article/Excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3).

- Authentication (Central Authentication Service):
  - `CAS_SERVER_URL`: `https://your.cas.server`.
  - `HOSTNAME`: `gather.local`.
  See more in [Django CAS client](https://github.com/mingchen/django-cas-ng).

- uWSGI specific:
  - `CUSTOM_UWSGI_ENV_FILE` Path to a file of environment variables to use with uWSGI.
  - `CUSTOM_UWSGI_SERVE_STATIC` Indicates if uWSGI also serves the static content.
    Is `false` if unset or set to empty string, anything else is considered `true`.
  - Any `UWSGI_A_B_C` Translates into the `a-b-c` uswgi option.
    > [
      *When passed as environment variables, options are capitalized and prefixed
      with UWSGI_, and dashes are substituted with underscores.*
    ](https://uwsgi-docs.readthedocs.io/en/latest/Configuration.html#environment-variables)

  See more in https://uwsgi-docs.readthedocs.io/

- Django specific:
  - `ADMIN_USERNAME`: `admin` the setup script will create a superuser
    with this username. There is no default value.
  - `ADMIN_PASSWORD`: `secresecret` the setup script will create the superuser
    with this password. There is no default value.
  - `DB_NAME`: `gather` Postgres database name.
  - `WEB_SERVER_PORT`: `8105` Web server port.

- Aether specific:
  - `EXTERNAL_APPS`: `aether-kernel,aether-odk`
    Comma separated list with the available modules.
    To avoid confusion, the values will match the container name prepending `aether-`,
    `kernel`, `odk`, `couchdb-sync`.

  - Aether Kernel:
    - `AETHER_KERNEL_TOKEN`: `aether_kernel_admin_user_auth_token`
      Token to connect to Aether Kernel Server.
    - `AETHER_KERNEL_URL`: `http://kernel:8100` Aether Kernel Server url.

  - Aether ODK:
    - `AETHER_ODK_TOKEN`: `aether_odk_admin_user_auth_token`
      Token to connect to Aether ODK Server.
    - `AETHER_ODK_URL`: `http://odk:8102` Aether ODK Server url.

  - Aether CouchDB Sync (*disabled*):
    - `AETHER_COUCHDB_SYNC_TOKEN`: `aether_couchdb_sync_admin_user_auth_token`
      Token to connect to Aether ODK Server.
    - `AETHER_COUCHDB_SYNC_URL`: `http://sync:8106` Aether CouchDB Sync Server url.

*[Return to TOC](#table-of-contents)*


## Usage

```bash
docker-compose up
```

This will start:

- **gather** on `http://gather.local/`.
- **aether-kernel** on `http://aether.local/kernel/`.
- **aether-odk** on `http://aether.local/odk/` or `http://aether.local:8443/odk/`.
- **aether-ui** on `http://aether.local/`.

All the created superusers have username `${ADMIN_USERNAME}` and
password `${ADMIN_PASSWORD}` in each container.

*[Return to TOC](#table-of-contents)*


### Users & Authentication

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

Build local aether and gather containers

```bash
./scripts/prepare-containers-local.sh
```

Start local aether and gather containers

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

| Action                                     | Command                                              |
| ------------------------------------------ | ---------------------------------------------------- |
| List predefined commands                   | `docker-compose run gather-assets help`              |
| Run tests                                  | `docker-compose run gather-assets test`              |
| Run code style tests                       | `docker-compose run gather-assets test_lint`         |
| Run JS tests                               | `docker-compose run gather-assets test_js`           |
| Create a shell inside the container        | `docker-compose run gather-assets bash`              |
| Execute shell command inside the container | `docker-compose run gather-assets eval <command>`    |
| Check outdated node libraries              | `docker-compose run gather-assets eval npm outdated` |
| Build assets used in the Django app        | `docker-compose run gather-assets build`             |
| Start webpack server with HRM              | `docker-compose run gather-assets start_dev`         |

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

*[Return to TOC](#table-of-contents)*


### Upgrade dependencies

#### Check outdated dependencies

```bash
docker-compose run --no-deps gather eval pip list --outdated
docker-compose run --no-deps gather-assets eval npm outdated
```

#### Update requirements file

```bash
docker-compose run --no-deps gather pip_freeze
```

*[Return to TOC](#table-of-contents)*
