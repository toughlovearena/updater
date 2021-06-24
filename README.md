# @toughlovearena/updater

![npm (scoped)](https://img.shields.io/npm/v/@toughlovearena/updater)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/toughlovearena/updater/Unit%20Tests?label=tests)

CLI tool for automatically pulling and updating dedicated servers for Tough Love Arena

## assumptions

Until configuration is added, Updater has these assumptions about your app:

- You are in a git repo and already on the correct branch such that `git pull` will get the latest version
- `npm run build` is all that's necessary before restarting the server
- Your entry point is `dist/index.js`

## usage

```js
import { Updater } from '@toughlovearena/updater';

// somewhere in app start
new Updater().cron();
```

```bash
npx @toughlovearena/updater
```
