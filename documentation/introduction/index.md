---
title: Gather - Introduction
permalink: documentation/introduction/index.html
description: Gather Documentation – Introduction to Gather
---

# What Is Gather?

Gather is a versatile, secure and performant platform for data collection. It can be used with existing data collection tools such as [ODK Collect](https://docs.opendatakit.org/collect-intro/), and be extended with a wide range of functionality to ensure data integrity and interoperability.  It provides easy deployment in a secure server or cloud environment and allows administrators to control which data fields can be exported. Gather is built on top of the [Aether platform](https://aether.ehealthafrica.org) and can publish survey data directly into a [CKAN portal](https://ckan.org/), [Elasticsearch stack](https://www.elastic.co/), and any other Aether publishing endpoint.

It contains a set of tools for creating surveys and collecting data. It is analogous to [ODK](https://opendatakit.org/), and includes components that allow it to function with elements of the ODK ecosystem, such as [XForms](https://docs.opendatakit.org/form-design-intro/), [XLSForms](https://docs.opendatakit.org/xlsform/) and [ODK Collect](https://docs.opendatakit.org/collect-intro/).

## Gather is for you if:

- you need people collecting data in the field by conducting surveys using mobile devices
- you need your collected data to be streamed in realtime to a third party system such as a data portal or analytic platform
- you need to control what fields get streamed to third party systems in order to ensure private data doesn't go to the wrong places
- you have survey data that needs to be normalized or split into several data sets with common join fields *(Coming Soon)*
- your organization is required to maintain full custody of data collected and it's distribution.
- your solution needs to be deployed to a production environment and begin collecting data hours and minutes, not days
- your organization needs to deploy to a local server or in the cloud *(Currently supporting AWS - Google and Microsoft coming soon)*

## In very broad brush strokes, the Gather workflow is:

- An admin creates a survey using ODK XForms or XLSForms and defines where the data goes and who is allowed to access it
- Registered users with Android devices use the ODK Collect app to remotely collect data and upload to the Gather server
- The Gather server maps and routes that data to it's proper destination
- Repeat

[Next Steps: Try it out](../try/index)
