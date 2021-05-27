#!/usr/bin/env node
// ! is required for bin export aka `npx @toughlovearena/updater`

import { kill, rebuild } from './rebuild';

if (require.main === module) {
  const option = process.argv[2];
  if (['stop', 'kill'].includes(option)) {
    // tslint:disable-next-line:no-console
    console.log('Stopping @toughlovearena/updater');
    kill();
  } else {
    // tslint:disable-next-line:no-console
    console.log('Running @toughlovearena/updater');
    rebuild();
  }
}
