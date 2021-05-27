#!/usr/bin/env node
// ! is required for bin export aka `npx @toughlovearena/updater-kill`

import { kill } from './rebuild';

if (require.main === module) {
  // tslint:disable-next-line:no-console
  console.log('Stopping @toughlovearena/updater');
  kill();
}
