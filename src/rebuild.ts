import * as childProcess from 'child_process';
import * as util from 'util';
import { CanGit } from './gitter';
import { log } from './log';

export interface CanRebuild {
  run(): void;
}

export class Rebuilder implements CanRebuild {
  constructor(private readonly gitter: CanGit) { }

  async run() {
    // git pull
    log('Updater: git pull');
    await this.gitter.pull();

    // install and build new version
    log('Updater: npm install');
    await util.promisify(childProcess.exec)('npm install');
    log('Updater: npm run build');
    await util.promisify(childProcess.exec)('npm run build');

    // stop, forcing forever to reboot
    log(`Updater: stopping`);
    process.exit();
  }
}
