import simpleGit, { SimpleGit } from 'simple-git';
import { rebuild } from './rebuild';

export interface UpdaterOptions {
  cronTimeout?: number;
  processTimeout?: number;
}

export class Updater {
  static readonly defaultCronTimeout = 30 * 1000; // 30 seconds
  static readonly defaultProcessTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days

  readonly startedAt: number = new Date().getTime();
  readonly cronTimeout: number;
  readonly processTimeout: number;
  private rebuilding = false;
  private interval: NodeJS.Timeout | undefined;

  constructor(options?: UpdaterOptions) {
    this.cronTimeout = options?.cronTimeout ?? Updater.defaultCronTimeout;
    this.processTimeout = options?.processTimeout ?? Updater.defaultProcessTimeout;
  }

  protected async hasChanged(): Promise<boolean> {
    const sg: SimpleGit = simpleGit();
    await sg.fetch();
    const status = await sg.status();
    return status.behind > 0;
  }
  protected async update(): Promise<void> {
    await rebuild();
  }

  async run() {
    if (this.rebuilding) {
      return;
    }

    let changes = false;
    try {
      changes = await this.hasChanged();
    } catch (err) {
      // git/network unavailable, swallow error
      changes = false;
    }

    if (this.rebuilding) {
      return;
    }

    const processTooOld = this.age() > this.processTimeout;
    if (changes || processTooOld) {
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
    this.interval = setInterval(() => this.run(), this.cronTimeout);
  }
  age() {
    return new Date().getTime() - this.startedAt;
  }
  async gitHash(): Promise<string> {
    const log = await simpleGit().log();
    return log.latest?.hash ?? '???';
  }
}
