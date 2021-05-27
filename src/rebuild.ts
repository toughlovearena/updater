import * as childProcess from 'child_process';
import simpleGit, { SimpleGit } from 'simple-git';
import * as util from 'util';
import { log } from './util';

export const rebuild = async () => {
  // git pull
  log('Updater: git pull');
  const sg: SimpleGit = simpleGit();
  await sg.pull();

  // install and build new version
  log('Updater: npm install');
  await util.promisify(childProcess.exec)('npm install');
  log('Updater: npm run build');
  await util.promisify(childProcess.exec)('npm run build');

  // prep restart
  process.on('exit', () => {
    log(`Updater: restarting`);
    childProcess.spawn(process.argv.slice(0, 1)[0], process.argv.slice(1), {
      cwd: process.cwd(),
      detached: true,
      stdio: 'inherit',
    });
  });

  // stop
  log(`Updater: stopping`);
  process.exit();
};
