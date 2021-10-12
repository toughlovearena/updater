import { TimeKeeper } from './time';

export interface Calendar {
  isInShutdownWindow(): boolean;
}

export class TuesdayAfterMidnightCalendar {
  readonly tuesdayEpoch = 1634018400000; // '10/12/2021, 2:00:00 AM'
  readonly oneHour = 3600000;
  readonly oneWeek = 604800000;
  constructor(private readonly timeKeeper: TimeKeeper) {}

  isInShutdownWindow() {
    const now = this.timeKeeper.now();
    let relativeToEpoch = now - this.tuesdayEpoch;
    while (relativeToEpoch < 0) {
      // should only happen in tests
      relativeToEpoch += this.oneWeek;
    }
    const moduloWeeks = relativeToEpoch % this.oneWeek;
    const isInWindow = moduloWeeks < this.oneHour * 2;
    return isInWindow;
  }
}
