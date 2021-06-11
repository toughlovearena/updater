import { Updater } from '../updater';

interface StatusCallback {
  resolve(changes: boolean): void;
  reject(): void;
}
interface UpdateCallback {
  resolve(): void;
  reject(): void;
}

async function sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

class FakeUpdater extends Updater {
  pendingStatus: StatusCallback[] = [];
  pendingUpdate: UpdateCallback[] = [];

  // override
  constructor() {
    super({ timeout: 5 });
  }
  protected async status() {
    return await new Promise<boolean>((resolve, reject) => {
      this.pendingStatus.push({
        resolve,
        reject,
      });
    });
  }
  protected async update() {
    return await new Promise<void>((resolve, reject) => {
      this.pendingUpdate.push({
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
    sut.pendingStatus.forEach((cb) => cb.resolve(false));
    sut.pendingUpdate.forEach((cb) => cb.resolve());
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

    expect(sut.pendingStatus.length).toBe(0);
    await sleep(sut.timeout);
    expect(sut.pendingStatus.length).toBeGreaterThan(0);
    sut.pendingStatus[0].resolve(true);
    await sleep(sut.timeout);

    expect(sut.pendingUpdate.length).toBeGreaterThanOrEqual(1);
    expect(sut.isRunning()).toBe(false);
  });
});
