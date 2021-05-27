# @toughlovearena/updater

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
