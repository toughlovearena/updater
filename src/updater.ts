import * as childProcess from 'child_process';
import simpleGit, { SimpleGit } from 'simple-git';

export class Updater {
  static readonly defaultTimeout = 30 * 1000; // 30 seconds

  readonly timeout: number;
  private rebuilding = false;
  private interval: NodeJS.Timeout | undefined;

  constructor(options?: { timeout?: number }) {
    this.timeout = options?.timeout ?? Updater.defaultTimeout;
  }

  protected async pull(): Promise<boolean> {
    const sg: SimpleGit = simpleGit();
    const pullResult = await sg.pull();
    return pullResult.summary.changes > 0;
  }
  protected async update(): Promise<void> {
    await childProcess.spawn('npm run updater-rebuild', {
      detached: true,
    });
  }

  async run() {
    if (this.rebuilding) { return; }

    const changes = await this.pull();

    if (this.rebuilding) { return; }

    if (changes) {
      this.clear();
      this.rebuilding = true;
      await this.update();
    }
  }

  clear() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
    this.interval = undefined;
  }
  isRunning() {
    return this.interval !== undefined;
  }
  cron() {
    this.clear();
    this.interval = setInterval(() => this.run(), this.timeout);
  }
}
