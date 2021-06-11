#!/usr/bin/env node
// ! is required for bin export aka `npx @toughlovearena/updater`

import * as childProcess from 'child_process';
import * as util from 'util';
import { log } from './log';

const startForever = async () => {
  log('Updater: npm install');
  await util.promisify(childProcess.exec)('npm install');
  log('Updater: npm run build');
  await util.promisify(childProcess.exec)('npm run build');

  log('Updater: starting forever');
  await util.promisify(childProcess.exec)('npx forever start dist/index.js');
};

if (require.main === module) {
  log('Running @toughlovearena/updater');
  startForever();
}
