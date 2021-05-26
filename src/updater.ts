import * as childProcess from 'child_process';
import simpleGit, { SimpleGit } from 'simple-git';

export class Updater {
  static readonly defaultTimeout = 30 * 1000; // 30 seconds

  private readonly timeout: number;
  private rebuilding = false;
  private interval: NodeJS.Timeout | undefined;

  constructor(options?: { timeout?: number, }) {
    this.timeout = options?.timeout ?? Updater.defaultTimeout;
  }

  protected async run() {
    if (this.rebuilding) { return; }

    const sg: SimpleGit = simpleGit();
    const pullResult = await sg.pull();

    if (this.rebuilding) { return; }

    const changes = (pullResult.summary.changes > 0);
    if (changes) {
      this.clear();
      this.rebuilding = true;
      await childProcess.spawn('npm run updater-rebuild', {
        detached: true,
      });
    }
  }

  clear() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
  }

  cron() {
    this.clear();
    this.interval = setInterval(() => this.run(), this.timeout);
  }
}
