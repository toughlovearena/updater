export interface TimeKeeper {
  now(): number;
  setCron(cb: () => void, ms: number): NodeJS.Timeout;
  clearCron(id: NodeJS.Timeout): void;
}

export const RealClock: TimeKeeper = {
  now: () => new Date().getTime(),
  setCron: (cb, ms) => setInterval(cb, ms),
  clearCron: (id) => clearInterval(id),
};
