#!/usr/bin/env node
// ! is required for bin export aka `npx @toughlovearena/updater`

import { rebuild } from './rebuild';

if (require.main === module) {
  // tslint:disable-next-line:no-console
  console.log('Running @toughlovearena/updater');
  rebuild();
}
