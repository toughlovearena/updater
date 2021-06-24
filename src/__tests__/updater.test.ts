import { Updater } from '../updater';
import { FakeTimeKeeper } from './__mocks__/fakeTimeKeeper';

interface StatusCallback {
  resolve(changes: boolean): void;
  reject(reason?: any): void;
}
interface UpdateCallback {
  resolve(): void;
  reject(reason?: any): void;
}

class FakeUpdater extends Updater {
  pendingStatus: StatusCallback[] = [];
  pendingUpdate: UpdateCallback[] = [];

  // override
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
  let tk: FakeTimeKeeper;
  let sut: FakeUpdater;
  beforeEach(() => {
    tk = new FakeTimeKeeper();
    sut = new FakeUpdater({ timeKeeper: tk, });
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

  test('cron() restarts on changes', async () => {
    expect(sut.isRunning()).toBe(false);
    expect(sut.cron()).toBe(undefined);
    expect(sut.isRunning()).toBe(true);

    expect(sut.pendingStatus.length).toBe(0);
    tk._increment(sut.cronTimeout);
    expect(sut.pendingStatus.length).toBe(1);

    // give up thread so other promises can resolve
    sut.pendingStatus[0].resolve(true);
    await FakeTimeKeeper.sleep(100);

    expect(sut.pendingUpdate.length).toBe(1);
    expect(sut.isRunning()).toBe(false);
  });

  test('cron() restarts on process timeout', async () => {
    sut = new FakeUpdater({
      timeKeeper: tk,
      cronTimeout: 10,
      processTimeout: 20,
    });
    expect(sut.isRunning()).toBe(false);
    expect(sut.cron()).toBe(undefined);
    expect(sut.isRunning()).toBe(true);

    tk._set(10);
    expect(sut.pendingStatus.length).toBe(1);
    expect(sut.pendingUpdate.length).toBe(0);
    expect(sut.isRunning()).toBe(true);

    // give up thread so other promises can resolve
    sut.pendingStatus[0].resolve(false);
    await FakeTimeKeeper.sleep(100);
    expect(sut.pendingStatus.length).toBe(1);
    expect(sut.pendingUpdate.length).toBe(0);
    expect(sut.isRunning()).toBe(true);

    tk._set(20);
    expect(sut.pendingStatus.length).toBe(1);
    expect(sut.pendingUpdate.length).toBe(1);
    expect(sut.isRunning()).toBe(false);
  });

  test('cron() handles network errors as non-changes', async () => {
    expect(sut.isRunning()).toBe(false);
    sut.cron();
    expect(sut.isRunning()).toBe(true);

    expect(sut.pendingStatus.length).toBe(0);
    tk._increment(sut.cronTimeout);
    expect(sut.pendingStatus.length).toBe(1);
    sut.pendingStatus[0].reject('this should be caught');

    expect(sut.pendingUpdate.length).toBe(0);
    expect(sut.isRunning()).toBe(true);
  });
});
