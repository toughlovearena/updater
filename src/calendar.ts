import { TimeKeeper } from "./time";

export class Calendar {
  readonly tuesdayEpoch = 1634018400000; // '10/12/2021, 2:00:00 AM'
  readonly oneHour = 3600000;
  readonly oneWeek = 604800000;
  constructor(private readonly timeKeeper: TimeKeeper) { }

  isInShutdownWindow() {
    const now = this.timeKeeper.now();
    const relativeToEpoch = now - this.tuesdayEpoch;
    const timeSinceWeeklyEpoch = relativeToEpoch - this.oneWeek;
    const isInWindow = timeSinceWeeklyEpoch < (this.oneHour * 2);
    return isInWindow;
  }
}
