import { Updater } from '../updater';
import { FakeGitter } from './__mocks__/fakeGitter';
import { FakeRebuilder } from './__mocks__/fakeRebuilder';
import { FakeTimeKeeper } from './__mocks__/fakeTimeKeeper';

describe('Updater', () => {
  let timeKeeper: FakeTimeKeeper;
  let gitter: FakeGitter;
  let rebuilder: FakeRebuilder;
  let sut: Updater;
  beforeEach(() => {
    timeKeeper = new FakeTimeKeeper();
    gitter = new FakeGitter();
    rebuilder = new FakeRebuilder();
    sut = new Updater({
      timeKeeper,
      gitter,
      rebuilder,
    });
  });
  afterEach(() => {
    // cleanup pending handles
    gitter.pendingStatus.forEach((cb) => cb.resolve(false));
    rebuilder.pendingUpdate.forEach((cb) => cb.resolve());
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

    expect(gitter.pendingStatus.length).toBe(0);
    timeKeeper._increment(sut.cronTimeout);
    expect(gitter.pendingStatus.length).toBe(1);

    // give up thread so other promises can resolve
    gitter.pendingStatus[0].resolve(true);
    await FakeTimeKeeper.sleep(100);

    expect(rebuilder.pendingUpdate.length).toBe(1);
    expect(sut.isRunning()).toBe(false);
  });

  test('cron() skips extra crons while awaiting the update', async () => {
    expect(sut.isRunning()).toBe(false);
    expect(sut.cron()).toBe(undefined);
    expect(sut.isRunning()).toBe(true);

    expect(gitter.pendingStatus.length).toBe(0);
    timeKeeper._increment(sut.cronTimeout);
    expect(gitter.pendingStatus.length).toBe(1);
    timeKeeper._increment(sut.cronTimeout);
    expect(gitter.pendingStatus.length).toBe(2);

    // resolve all
    gitter.pendingStatus.forEach(p => p.resolve(true));
    await FakeTimeKeeper.sleep(100);

    // try to run a bunch more times to simulate poorly cleaned up cron
    sut.run();
    sut.run();
    sut.run();

    // expect only 2 status calls and 1 update trigger
    expect(gitter.pendingStatus.length).toBe(2);
    expect(rebuilder.pendingUpdate.length).toBe(1);
    expect(sut.isRunning()).toBe(false);
  });

  test('cron() restarts on process timeout', async () => {
    sut = new Updater({
      timeKeeper,
      gitter,
      rebuilder,
      cronTimeout: 10,
      processTimeout: 20,
    });
    expect(sut.isRunning()).toBe(false);
    expect(sut.cron()).toBe(undefined);
    expect(sut.isRunning()).toBe(true);

    timeKeeper._set(10);
    expect(gitter.pendingStatus.length).toBe(1);
    expect(rebuilder.pendingUpdate.length).toBe(0);
    expect(sut.isRunning()).toBe(true);

    // give up thread so other promises can resolve
    gitter.pendingStatus[0].resolve(false);
    await FakeTimeKeeper.sleep(100);
    expect(gitter.pendingStatus.length).toBe(1);
    expect(rebuilder.pendingUpdate.length).toBe(0);
    expect(sut.isRunning()).toBe(true);

    timeKeeper._set(20);
    expect(gitter.pendingStatus.length).toBe(1);
    expect(rebuilder.pendingUpdate.length).toBe(1);
    expect(sut.isRunning()).toBe(false);
  });

  test('cron() handles network errors as non-changes', async () => {
    expect(sut.isRunning()).toBe(false);
    sut.cron();
    expect(sut.isRunning()).toBe(true);

    expect(gitter.pendingStatus.length).toBe(0);
    timeKeeper._increment(sut.cronTimeout);
    expect(gitter.pendingStatus.length).toBe(1);
    gitter.pendingStatus[0].reject('this should be caught');

    expect(rebuilder.pendingUpdate.length).toBe(0);
    expect(sut.isRunning()).toBe(true);
  });
});
