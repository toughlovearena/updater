import { TimeKeeper } from "../../time";

type CronInfo = {
  id: NodeJS.Timeout;
  lastRun: number;
  period: number;
  cb(): void;
}

export class FakeTimeKeeper implements TimeKeeper {
  private ticks = 0;
  private crons: CronInfo[] = [];

  static sleep(ms: number) {
    return new Promise<void>(resolve => {
      setTimeout(resolve, ms);
    });
  }
  _set(state: number) {
    this.ticks = state;
    this.crons.forEach(ci => {
      let nextRun = ci.lastRun + ci.period;
      while (nextRun <= this.ticks) {
        ci.cb();
        ci.lastRun = nextRun;
        nextRun = ci.lastRun + ci.period;
      }
    });
  }
  _increment(num?: number) {
    this._set(this.ticks + (num || 1));
  }

  now() { return this.ticks; }
  setCron(cb: () => void, ms: number) {
    // just to get a real NodeJS.Timeout
    const id = setTimeout(() => { }, 0);
    this.crons.push({
      id,
      lastRun: this.now(),
      period: ms,
      cb,
    });
    return id;
  }
  clearCron(id: NodeJS.Timeout) {
    this.crons = this.crons.filter(ci => ci.id !== id);
  }
}
