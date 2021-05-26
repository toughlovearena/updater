import { Updater } from '../updater';
import { sleep } from '../util';

interface PullCallback {
  resolve(changes: boolean): void;
  reject(): void;
}
interface UpdateCallback {
  resolve(): void;
  reject(): void;
}

class FakeUpdater extends Updater {
  _pulls: PullCallback[] = [];
  _updates: UpdateCallback[] = [];

  // override
  constructor() {
    super({ timeout: 5, });
  }
  protected async pull() {
    return await new Promise<boolean>((resolve, reject) => {
      this._pulls.push({
        resolve,
        reject,
      });
    });
  }
  protected async update() {
    return await new Promise<void>((resolve, reject) => {
      this._updates.push({
        resolve,
        reject,
      });
    });
  }
}

describe('Updater', () => {
  let sut: FakeUpdater;
  beforeEach(() => {
    sut = new FakeUpdater();
  });
  afterEach(() => {
    // cleanup pending handles
    sut._pulls.forEach(cb => cb.resolve(false));
    sut._updates.forEach(cb => cb.resolve());
    sut.clear();
  });

  test('cron() can be started and cleared', async () => {
    expect(sut.isRunning()).toBe(false);
    sut.cron();
    expect(sut.isRunning()).toBe(true);
    sut.clear();
    expect(sut.isRunning()).toBe(false);
  });

  test('cron() terminates on changes', async () => {
    expect(sut.isRunning()).toBe(false);
    expect(sut.cron()).toBe(undefined);
    expect(sut.isRunning()).toBe(true);

    expect(sut._pulls.length).toBe(0);
    await sleep(sut.timeout);
    expect(sut._pulls.length).toBeGreaterThan(0);
    sut._pulls[0].resolve(true);
    await sleep(sut.timeout);

    expect(sut._updates.length).toBeGreaterThanOrEqual(1);
    expect(sut.isRunning()).toBe(false);
  });
});
