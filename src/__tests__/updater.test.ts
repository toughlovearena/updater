import { Updater } from '../updater';

interface StatusCallback {
  resolve(changes: boolean): void;
  reject(reason?: any): void;
}
interface UpdateCallback {
  resolve(): void;
  reject(reason?: any): void;
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
    super({ cronTimeout: 5 });
  }
  protected async hasChanged() {
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
    await sleep(sut.cronTimeout);
    expect(sut.pendingStatus.length).toBeGreaterThan(0);
    sut.pendingStatus[0].resolve(true);
    await sleep(sut.cronTimeout);

    expect(sut.pendingUpdate.length).toBeGreaterThanOrEqual(1);
    expect(sut.isRunning()).toBe(false);
  });

  test('cron() handles network errors as non-changes', async () => {
    expect(sut.isRunning()).toBe(false);
    sut.cron();
    expect(sut.isRunning()).toBe(true);

    expect(sut.pendingStatus.length).toBe(0);
    await sleep(sut.cronTimeout);
    expect(sut.pendingStatus.length).toBeGreaterThan(0);
    sut.pendingStatus[0].reject('this should be caught');
    await sleep(sut.cronTimeout);

    expect(sut.pendingUpdate.length).toBe(0);
    expect(sut.isRunning()).toBe(true);
  });
});
