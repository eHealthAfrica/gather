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
  - [Code style](#code-style)
  - [Naming conventions](#naming-conventions)
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
- [openssl](https://www.openssl.org/)

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

**Note:** Make sure you have [openssl](https://www.openssl.org/) installed in your system.

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

See also [Django settings](https://docs.djangoproject.com/en/2.2/ref/settings/).

See also [Aether Django SDK environment variables](https://github.com/eHealthAfrica/aether-django-sdk-library#environment-variables).

#### Gather instance

- Gather specific:
  - `INSTANCE_NAME`: `Gather 3` identifies the current instance among others.

- Data export:
  - `EXPORT_MAX_ROWS_SIZE`: between `0` and `1048575` indicates the maximum
    number of rows to include in the export file.
    The limit is an [Excel 2007 restriction](https://support.office.com/en-us/article/Excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3).

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
- **aether-odk** on `http://aether.local/odk/`.
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

### Code style

The code style is tested:

- In **python** with [flake8](http://flake8.pycqa.org/en/latest/).
  Defined in the file `app/setup.cfg`.
- In **javascript** with [standard](https://github.com/feross/standard/).
- In **styles** with [sass-lint](https://github.com/sasstools/sass-lint/).
  Defined in the file `app/gather/assets/conf/sass-lint.yml`.

```bash
# Python files
docker-compose run --rm --no-deps gather test_lint
# Javascript files
docker-compose run --rm --no-deps gather-assets eval npm run test-lint-js
# CSS files
docker-compose run --rm --no-deps gather-assets eval npm run test-lint-sass
```

*[Return to TOC](#table-of-contents)*

### Naming conventions

There are a couple of naming/coding conventions followed by the
Python modules and the React Components:

- Names are self-explanatory like `export_project`, `RefreshingSpinner`,
  `ProjectList`, `constants` and so on.

- Case conventions:

  - Javascript specific:
    - component names use title case (`TitleCase`)
    - utility file names use kebab case (`kebab-case`)
    - method and variable names use camel case (`camelCase`)
  - Python specific:
    - class names use title case (`TitleCase`)
    - file, method and variable names use snake case (`snake_case`)

- Javascript specific:

  - Meaningful suffixes:
    - `Container` indicates that the component will fetch data from the server.
    - `List` indicates that the data is a list and is displayed as a table or list.
    - `Form` indicates that a form will be displayed.
  - The file name will match the default Component name defined inside,
    it might be the case that auxiliary components are also defined within
    the same file.
  - App "agnostic" components are kept in folder `app/gather/assets/apps/components`
  - App "agnostic" methods are kept in folder `app/gather/assets/apps/utils`

- - -
**Comments are warmly welcome!!!**
- - -

*[Return to TOC](#table-of-contents)*

### Frontend assets

Frontend assets include JS, CSS, and fonts. They are all handled by webpack.

Frontend assets are mounted on the pages via the
[django-webpack-loader](https://github.com/owais/django-webpack-loader).

* There is a file with all the apps list: `app/gather/assets/conf/webpack.apps.js`.

* There are three webpack configuration files:

  - `app/gather/assets/conf/webpack.common.js`  -- contains the common features to build the webpack files.
  - `app/gather/assets/conf/webpack.server.js`  -- starts the server in port `3005` with Hot Module Replacement (HMR).
  - `app/gather/assets/conf/webpack.prod.js`    -- compiles the files to be used in the Django app.

* The `start_dev` entry point starts a webpack development server (port `3005`),
  that watches assets, rebuilds and does hot reloading of JS Components.

  ```bash
  docker-compose up gather-assets
  ```

* The `build` entry point compiles the files to be used in the Django app.
  The resultant files are kept in the `app/gather/assets/bundles` folder.

  ```bash
  docker-compose run --rm gather-assets build
  ```

* The CSS build is separate, and can contain both `.sass` and `.css` files.
  They spit out a webpack build called `styles.css`.

* Each page has their own JS entry point (needs to be defined in `webpack.apps.js`).
  On top of that, they load a common chunk, containing `jquery`, `bootstrap` and other
  stuff that the `webpack common chunk` plugin finds is shared between the apps.

*[Return to TOC](#table-of-contents)*


## Containers and services

The list of the main containers:


| Container         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| db                | [PostgreSQL](https://www.postgresql.org/) database                |
| **gather**        | Gather app                                                        |
| **gather-assets** | Gather assets module                                              |
| **kernel**        | Aether Kernel app                                                 |
| **odk**           | Aether ODK Collect Adapter app (imports data from ODK Collect)    |
| **ui**            | Aether Kernel UI (only needed for advanced mapping functionality) |


All the containers definition for development can be found in the
[docker-compose-base.yml](docker-compose-base.yml) file.

*[Return to TOC](#table-of-contents)*


## Run commands in the containers

The pattern to run a command is always

```bash
docker-compose run --rm [--no-deps] <container-name> <entrypoint-command> <...args>
```

If there is no interaction with any other container then include the option `--no-deps`.

See more in [docker-compose run](https://docs.docker.com/compose/reference/run).

*[Return to TOC](#table-of-contents)*


### Python container

The [app/entrypoint.sh](app/entrypoint.sh) script offers a range of commands
to start services or run commands.
The full list of commands can be seen in the script file.

The following are some examples:

| Action                                     | Command                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| List predefined commands                   | `docker-compose run --rm gather help`                     |
| Run tests                                  | `docker-compose run --rm gather test`                     |
| Run code style tests                       | `docker-compose run --rm gather test_lint`                |
| Run python tests                           | `docker-compose run --rm gather test_coverage`            |
| Create a shell inside the container        | `docker-compose run --rm gather bash`                     |
| Execute shell command inside the container | `docker-compose run --rm gather eval <command>`           |
| Run django manage.py                       | `docker-compose run --rm gather manage help`              |
| Create a python shell                      | `docker-compose run --rm gather manage shell`             |
| Create a postgresql shell                  | `docker-compose run --rm gather manage dbshell`           |
| Show ORM migrations                        | `docker-compose run --rm gather manage showmigrations`    |
| Create pending ORM migration files         | `docker-compose run --rm gather manage makemigrations`    |
| Apply pending ORM migrations               | `docker-compose run --rm gather manage migrate`           |
| Check outdated python libraries            | `docker-compose run --rm gather eval pip list --outdated` |
| Update outdated python libraries           | `docker-compose run --rm gather pip_freeze`               |
| Start django development server            | `docker-compose run --rm gather start_dev`                |
| Start uwsgi server                         | `docker-compose run --rm gather start`                    |

*[Return to TOC](#table-of-contents)*


### Node container

The [app/gather/assets/conf/entrypoint.sh](app/gather/assets/conf/entrypoint.sh)
script offers a range of commands to start services or run commands.
The full list of commands can be seen in the script file.

The following are some examples:

| Action                                     | Command                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| List predefined commands                   | `docker-compose run --rm gather-assets help`              |
| Run tests                                  | `docker-compose run --rm gather-assets test`              |
| Run code style tests                       | `docker-compose run --rm gather-assets test_lint`         |
| Run JS tests                               | `docker-compose run --rm gather-assets test_js`           |
| Create a shell inside the container        | `docker-compose run --rm gather-assets bash`              |
| Execute shell command inside the container | `docker-compose run --rm gather-assets eval <command>`    |
| Check outdated node libraries              | `docker-compose run --rm gather-assets eval npm outdated` |
| Build assets used in the Django app        | `docker-compose run --rm gather-assets build`             |
| Start webpack server with HMR              | `docker-compose run --rm gather-assets start_dev`         |

*[Return to TOC](#table-of-contents)*


### Run tests

The Python code is tested using
[coverage](https://bitbucket.org/ned/coveragepy).

The CSS style is analyzed by
[Sass Lint](https://github.com/sasstools/sass-lint).

The Javascript style is analyzed by
[Standard JS](https://github.com/feross/standard/).

The Javascript code is tested using
[Jest](https://facebook.github.io/jest/docs/en/getting-started.html)
and [Enzyme](http://airbnb.io/enzyme/).

- Python test files are kept in the folder `tests` of each module
  and the name is `test_my_module.py`.
- Javascript test files are kept in the same folder and the name
  is `MyComponent.spec.jsx` or `my-utility.spec.jsx`.

This will stop ALL running containers and execute `gather` tests.

```bash
./scripts/test_gather.sh
```

or

```bash
docker-compose run --rm gather test
docker-compose run --rm gather-assets test
```

or

```bash
docker-compose run --rm gather test_lint
docker-compose run --rm gather test_coverage

docker-compose run --rm gather-assets test_lint
docker-compose run --rm gather-assets test_js

# more detailed
docker-compose run --rm gather-assets eval npm run test-lint-sass
docker-compose run --rm gather-assets eval npm run test-lint-js

# in case you need to check `console.log` messages
docker-compose run --rm gather-assets eval npm run test-js-verbose
```

*[Return to TOC](#table-of-contents)*


### Upgrade dependencies

#### Check outdated dependencies

```bash
docker-compose run --rm --no-deps gather eval pip list --outdated
docker-compose run --rm --no-deps gather-assets eval npm outdated
```

#### Update requirements file

```bash
docker-compose run --rm --no-deps gather pip_freeze
```

*[Return to TOC](#table-of-contents)*
