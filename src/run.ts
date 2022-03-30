#!/usr/bin/env node
// ! is required for bin export aka `npx @toughlovearena/updater`

import * as childProcess from 'child_process';
import * as util from 'util';
import { log } from './log';
import { SETTINGS } from './settings';

const startForever = async () => {
  log('Updater: npm install');
  await util.promisify(childProcess.exec)('npm install');
  log(`Updater: ${SETTINGS.bashBuild}`);
  await util.promisify(childProcess.exec)(SETTINGS.bashBuild);

  log('Updater: starting forever');
  await util.promisify(childProcess.exec)(`npx forever start ${SETTINGS.nodeScript}`);
};

if (require.main === module) {
  log('Running @toughlovearena/updater');
  startForever();
}
