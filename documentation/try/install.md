---
title: Gather Install
permalink: documentation/try/install.html
description: Gather Documentation – Install
---

# Installing Gather

Gather actually consists of several different servers and services that run in their own virtual network environment.  More specifically, it utilizes container-based virtualization, which allows multiple isolated systems, called containers, to run on a single host and access a single kernel.  The container we use is [Docker](https://www.docker.com/) and we use [Docker Compose](https://docs.docker.com/compose/) to define and script deployment configurations (this is known as “orchestration”).  In production, Gather is deployed and maintained using [Kubernetes](https://kubernetes.io/), a more robust system that takes advantage of this technology.

For this demo, you will not need to know much about containers or Docker, although a basic understanding is helpful.  More information can be found on the [Docker website](https://www.docker.com/what-docker) if you’re curious.

Before following this run-through, make sure you have met the prerequisites defined in the [previous section](index).

## Local Browser Client

As mentioned earlier, we are actually setting up an Gather development environment for these exercises.  In this environment, we need to define some domain names that will resolve to the actual location of the server.  It only needs to be done on the machine that you will be using your web browser from.  You will need to edit your **/etc/hosts** file which will require **Administrator** or **root** permissions.  Using your favorite plain text editor, open **/etc/hosts** or **C:\Windows\System32\Drivers\etc\hosts** for editing.

If you are running both the Gather server and web browser client on the same computer, add a new line as shown below:

```text
127.0.0.1    aether.local gather.local
```

If your server is running remotely from your web browser, for example on AWS, add a line to your **/etc/hosts** substituting the IP address of your Gather server for **XX.XX.XX.XX**.  The new line should look like:

```text
XX.XX.XX.XX    aether.local gather.local
```

_NOTE: Editing your **/etc/hosts** or **C:\Windows\System32\Drivers\etc\hosts** file will **not** be required in a production environment._

You will also need to register some domains for local resolution on your computer. This means editing your hosts file. On Mac/Linux this is at `/etc/hosts`; Add a new line to include:

```text
127.0.0.1    aether.local gather.local
```

## ODK Collect

For data collection, you will need an Android phone or tablet with [ODK Collect](https://play.google.com/store/apps/details?id=org.odk.collect.android) installed.  Open the Google Play store on your Android phone and search for **ODK Collect** and install.  Configuration instructions for **ODK collect** will come in a later section.

## Setup

### Gather-Deploy

We’ve created a helper repository on GitHub called **gather-deploy** to help you get started.  It contains the instructions that Docker needs in order to download and install the components that make up the Gather server along with Aether: UI, Kernel and ODK (required to gather data with ODK Collect) but not Aether Connect.

Begin by cloning this repository to your computer:

```bash
git clone https://github.com/eHealthAfrica/gather-deploy.git

cd gather-deploy
```

If you are starting Gather for the first time, you will need to create some docker resources (networks and volumes) and generate credentials for all applications:

```bash
./setup.sh
```

To start all the servers and services, just type

```bash
./start.sh
```

The first time this is run, it will take a while to download all the artifacts to your machine.  Those artifacts are cached locally and will be available the next time you run Gather so the long startup only happens once.

Give Gather a minute or so to start up, and then go to [gather.local](http://gather.local) in your browser. Once Gather is ready, you should see the login screen:

![Gather login screen](/images/gather-login.png)

_Tip: If you see an **Welcome to nginx!** screen instead of the one shown above, just reload the page - that means you were too fast!_

You can login with the following credentials:

|Username|**admin**|
|Password|**adminadmin**|

You should now see the Gather main screen:

![Gather main screen](/images/gather-first-screen.png)

### Aether-Bootstrap

We’ve created another helper repository on GitHub called **aether-bootstrap** to help you get started.  It contains the instructions that Docker needs in order to download and install the components that make up the Gather server along with Aether Connect, CKAN, Elasticsearch/Kibana and more.

Begin by cloning this repository to your computer:

```bash
git clone https://github.com/eHealthAfrica/aether-bootstrap.git

cd aether-bootstrap
```

If you are starting Gather for the first time, you will need to create some docker resources (networks and volumes) and generate credentials for all applications:

```bash
./scripts/init.sh
```

_Note: Aether-Bootstrap enables multitenancy! The default setup creates three tenants: dev, prod and test._

To start all the servers and services, just type

```bash
./scripts/start.sh
```

The first time this is run, it will take a while to download all the artifacts to your machine.  Those artifacts are cached locally and will be available the next time you run Gather so the long startup only happens once.

Give Gather a minute or so to start up, and then go to [gather.local/{tenant}](http://gather.local/dev) in your browser. Once Gather is ready, you should see the login screen:

![Gather login screen](/images/gather-login.png)

You can login with the following credentials:

|Username|**admin**|
|Password|**adminadmin**|

You should now see the Gather main screen:

![Gather main screen](/images/gather-first-screen.png)

## Recap

In this section cloned the `gather-deploy`/`aether-bootstrap` helper repositories and then spun up a Gather instance by running a single command.

In the next section, we’re going to collect some data using the ODK Collect Android application.

<div style="margin-top: 2rem; text-align: center">
<a href="collect-data">Next Step: Collecting Data</a>
</div>
