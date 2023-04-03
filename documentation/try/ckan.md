---
title: Gather – Sending Data to CKAN
permalink: documentation/try/ckan.html
description: Gather Documentation – Try it for yourself
---

# Sending Data to a CKAN Data Portal

In this section we will add the components necessary to spin up a new CKAN instance and have our collected data published to it in real time.  You should have a Gather server running, have submitted some data to it and have Aether Connect running.  If not, go to the [previous section](aether-connect)

## Setting Up CKAN

We’re going to use a script to make it easier to install and configure CKAN. This will download Docker images for CKAN and perform the necessary configuration. It will then prompt you for a password for the `admin` user. In your terminal, navigate to the `aether-bootstrap` directory, and then modify the `options.txt` file:

```text
## CKAN
ENABLE_CKAN=true
```

Then run the script:

```bash
./scripts/init.sh
./scripts/start.sh
```

Once this has completed, open a new browser window, go to <http://localhost:5000> and login with username `admin` and the password included in `.env` file: `CKAN_SYSADMIN_PASSWORD`.

Now go to <http://localhost:5000/organization> and add a new organization:

![Adding an Organization in CKAN](/images/ckan-organizations.png)

Name it `eHADemo` and click **Create Organisation**.

Now that we have CKAN running, we need to turn to Aether Connect, the data publishing half of the Aether platform.

## Setting Up the CKAN Consumer

In order to communicate with CKAN, the CKAN Consumer needs an API Key. This can be found in the CKAN User page at <http://localhost:5000/user/admin>:

![Getting the CKAN API Key](/images/ckan-api-key.png)

If it's not present you can regenerate it in this page <http://localhost:5000/user/edit/admin>, clicking on **Regenerate API Key**.

![Getting the CKAN API Key](/images/ckan-regenerate-api-key.png)

Now you need to set up it in the CKAN Consumer.  Using the consumer API usually on <http://aether.local/dev/ckan-consumer>, register the following artifact.

POST <http://aether.local/dev/ckan-consumer/add>

```json
  {
    "id": "ckan-id",
    "name": "CKAN Instance",
    "url": "http://ckan:5000",
    "key": "[your-ckan-api-key]"
  }
```

## View the Data in CKAN

Open the datasets screen in CKAN at <http://localhost:5000/dataset/>. You should see something like this (the name of your dataset will be slightly different):

![Our dataset in CKAN](/images/ckan-datasets.png)

Click on the dataset. You should now see the main screen for our new dataset. Click again on the dataset name as shown here:

![The dataset link](/images/ckan-dataset-link.png)

Now click on the **Manage** button, and in the next page go to the **Views** tab. Click the **New view** button and select **Data Explorer**. Give the view a name and save it.

Now if you go back to the main screen for our dataset, press the **Explore** button and select **Preview**, you will see the data you submitted shown in a table:

![The dataset view in CKAN](/images/ckan-dataset-view.png)

Congratulations - we are now publishing the collected data to CKAN!

If you now fill in the `example-microcensus` form again in ODK Collect and submit it to Gather, the data will be automatically published to CKAN.

## Recap

In this section we created, configured and started a local CKAN instance. We then configured and deployed the Aether-CKAN consumer that reads messages from the Kafka message queue and posts that data to CKAN. We then viewed in CKAN the data that we collected earlier via ODK.

<div style="margin-top: 2rem; text-align: center">
<a href="clean-up">Final Steps: Cleaning Up</a>
</div>
