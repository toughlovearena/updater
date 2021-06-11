#!/usr/bin/env node
// ! is required for bin export aka `npx @toughlovearena/updater`

import * as childProcess from 'child_process';
import * as util from 'util';

const startForever = async () => {
  await util.promisify(childProcess.exec)('npx forever start dist/index.js');
};

if (require.main === module) {
  // tslint:disable-next-line:no-console
  console.log('Running @toughlovearena/updater');
  startForever();
}
