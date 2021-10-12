import { Calendar, TuesdayAfterMidnightCalendar } from './calendar';
import { CanGit, Gitter } from './gitter';
import { CanRebuild, Rebuilder } from './rebuild';
import { RealClock, TimeKeeper } from './time';

export interface UpdaterArgs {
  timeKeeper?: TimeKeeper;
  calendar?: Calendar;
  gitter?: CanGit;
  rebuilder?: CanRebuild;
  cronTimeout?: number;
  processTimeout?: number;
}

export class Updater {
  static readonly defaultCronTimeout = 30 * 1000; // 30 seconds
  static readonly defaultProcessTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days

  readonly timeKeeper: TimeKeeper;
  readonly calendar: Calendar;
  readonly gitter: CanGit;
  readonly rebuilder: CanRebuild;
  readonly startedAt: number;
  readonly cronTimeout: number;
  readonly processTimeout: number;
  private rebuilding = false;
  private interval: NodeJS.Timeout | undefined;

  constructor(options?: UpdaterArgs) {
    this.timeKeeper = options?.timeKeeper ?? RealClock;
    this.calendar = options?.calendar ?? new TuesdayAfterMidnightCalendar(this.timeKeeper);
    this.gitter = options?.gitter ?? new Gitter();
    this.rebuilder = options?.rebuilder ?? new Rebuilder(this.gitter);
    this.startedAt = this.timeKeeper.now();
    this.cronTimeout = options?.cronTimeout ?? Updater.defaultCronTimeout;
    this.processTimeout = options?.processTimeout ?? Updater.defaultProcessTimeout;
  }

  async run() {
    if (this.rebuilding) {
      return;
    }

    let shouldRestart = (
      (this.age() >= this.processTimeout) &&
      this.calendar.isInShutdownWindow()
    );

    if (!shouldRestart) {
      try {
        shouldRestart = await this.gitter.hasChanged();
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
      await this.rebuilder.run();
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
}
