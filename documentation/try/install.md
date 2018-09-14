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
As mentioned earlier, we are actually setting up an Gather development environment for these exercises.  In this environment, we need to define some domain names that will resolve to the actual location of the server.  It only needs to be done on the machine that you will be using your web browser from.  You will need to edit your **/etc/hosts** file which will require **Administrator** or **root** permissions.  Using your favorite plain text editor, open **/etc/hosts** for editing.  

If you are running both the Gather server and web browser client on the same computer, modify the line that starts with **127.0.0.1** as shown Below
```
127.0.0.1    localhost odk.aether.local ui.aether.local kernel.aether.local gather.local
```
If your server is running remotely from your web browser, for example on AWS,  add a line to your **/etc/hosts** substsituting the IP address of your Gather server for **XX.XX.XX.XX**.  The new line should look like:
```
XX.XX.XX.XX  ui.aether.local kernel.aether.local odk.aether.local gather.local
```
_NOTE: Editing your **/etc/hosts** file will **not** be required in a production environment._

You will also need to register some domains for local resolution on your computer. This means editing your hosts file. On Mac/Linux this is at `/etc/hosts`; Modify the line that starts with `127.0.0.1` to include:

## ODK Collect
For data collection, you will need an Android phone or tablet with [ODK Collect](https://play.google.com/store/apps/details?id=org.odk.collect.android&hl=en_US) installed.  Open the Google Play store on your Android phone and search for **ODK Collect** and install.  Configuration instructions for **ODK collect** will come in a later section.

## Setup
We’ve created a helper repository on GitHub called **gather-deploy** to help you get started.  It contains the instructions that Docker needs in order to download and install the components that make up the Gather server.  

Begin by cloning this repository to your computer:

```
git clone --recurse-submodules https://github.com/eHealthAfrica/gather-deploy.git

cd gather-deploy
```

The `--recurse-submodules` option is necessary because Gather Deploy uses another repository called [Aether Bootstrap](https://github.com/eHealthAfrica/aether-bootstrap) to install and configure Aether, the underlying platform on which Gather is built.

If you are starting Gather for the first time, you will need to create some docker resources (networks and volumes) and generate credentials for all applications:
```
./scripts/initialise_docker_environment.sh
```
To start all the servers and services, just type

```
docker-compose up
```

_NOTE: If you’d like to **not** see the logging and debug output of the containers, append a `-d` to the end of the previous and all future `docker-compose` commands. The  `-d` will force the Docker containers to run in the background. This also means that you will **not** need to run multiple terminal windows for the rest of these exercises_

The first time this is run, it will take a while to download all the artifacts to your machine.  Those artifacts are cached locally and will be available the next time you run Gather so the long startup only happens once.

Give Gather a minute or so to start up, and then go to [gather.local](http://gather.local) in your browser. Once Gather is ready, you should see the login screen:

![Gather login screen](/images/gather-login.png)

*Tip: If you see an **Welcome to nginx!** screen instead of the one shown above, just reload the page - that means you were too fast!*

You can login with the following credentials:

|Username|**admin**|
|Password|**adminadmin**|

You should now see the Gather main screen:

![Gather main screen](/images/gather-first-screen.png)

## Recap

In this section cloned the `gather-deploy` helper repository and then spun up a Gather instance by running a single command.

In the next section, we’re going to collect some data using the ODK Collect Android application.

<div style="margin-top: 2rem; text-align: center"><a href="collect-data">Next Step: Collecting Data</a></div>
