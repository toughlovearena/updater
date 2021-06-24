import simpleGit, { SimpleGit } from 'simple-git';
import { rebuild } from './rebuild';
import { RealClock, TimeKeeper } from './time';

export interface UpdaterArgs {
  timeKeeper?: TimeKeeper;
  cronTimeout?: number;
  processTimeout?: number;
}

export class Updater {
  static readonly defaultCronTimeout = 30 * 1000; // 30 seconds
  static readonly defaultProcessTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days

  readonly timeKeeper: TimeKeeper;
  readonly startedAt: number;
  readonly cronTimeout: number;
  readonly processTimeout: number;
  private rebuilding = false;
  private interval: NodeJS.Timeout | undefined;

  constructor(options?: UpdaterArgs) {
    this.timeKeeper = options?.timeKeeper ?? RealClock;
    this.startedAt = this.timeKeeper.now();
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

    let shouldRestart = this.age() >= this.processTimeout;

    if (!shouldRestart) {
      try {
        shouldRestart = await this.hasChanged();
      } catch (err) {
        // git/network unavailable, swallow error
        shouldRestart = false;
      }

      if (this.rebuilding) {
        return;
      }
    }

    if (shouldRestart) {
      this.clear();
      this.rebuilding = true;
      await this.update();
    }
  }

  clear() {
    if (this.interval !== undefined) {
      this.timeKeeper.clearCron(this.interval);
    }
    this.interval = undefined;
  }
  isRunning() {
    return this.interval !== undefined;
  }
  cron() {
    this.clear();
    this.interval = this.timeKeeper.setCron(() => this.run(), this.cronTimeout);
  }
  age() {
    return this.timeKeeper.now() - this.startedAt;
  }
  async gitHash(): Promise<string> {
    const log = await simpleGit().log();
    return log.latest?.hash ?? '???';
  }
}
