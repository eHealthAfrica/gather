---
title: Gather – Cleaning Up
permalink: documentation/try/clean-up.html
description: Gather Documentation – Try it for yourself
---

# Cleaning Up

## Working with Gather Deploy

If you’d like to wipe all the data that you created during this walkthrough, this section goes through the necessary commands. These steps assume that you’re currently in the `gather-deploy` directory.

1. Take down all containers:

```bash
./stop.sh
```

2. Wipe *ALL* data:

```bash
./wipe.sh
```

You will now be able to repeat the steps of this tutorial from a fresh starting point, should you wish to do so.

## Working with Aether Bootstrap

If you’d like to wipe all the data that you created during this walkthrough, this section goes through the necessary commands. These steps assume that you’re currently in the `aether-bootstrap` directory.

1. Take down all containers:

```bash
./scripts/down.sh
```

2. Wipe *ALL* data:

```bash
./scripts/wipe.sh
```

You will now be able to repeat the steps of this tutorial from a fresh starting point, should you wish to do so.
