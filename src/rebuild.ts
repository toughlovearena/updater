import * as childProcess from 'child_process';
import * as forever from 'forever';
import simpleGit, { SimpleGit } from 'simple-git';

// tslint:disable-next-line:no-console
const scriptLog = console.log;

const scriptPath = 'dist/index.js';
export const rebuild = async () => {
  // git pull
  scriptLog('Updater: git pull');
  const sg: SimpleGit = simpleGit();
  await sg.pull();

  // install and build new version
  scriptLog('Updater: npm install');
  await childProcess.exec('npm install');
  scriptLog('Updater: npm run build');
  await childProcess.exec('npm run build');

  // stop
  await kill();

  // start
  scriptLog(`Updater: forever start ${scriptPath}`);
  forever.startDaemon(scriptPath);
};

export const kill = () => {
  return new Promise<void>((resolve) => {
    scriptLog(`Updater: forever stop ${scriptPath}`);
    try {
      const emitter = forever.stop(scriptPath);
      emitter.on('error', resolve);
      emitter.on('stop', resolve);
    } catch (err) {
      // swallow error, continue
      resolve();
    }
  });
};
