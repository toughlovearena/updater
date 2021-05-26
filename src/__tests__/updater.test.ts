import { Updater } from '../updater';

describe('Updater', () => {
  test('cron()', async () => {
    const sut = new Updater();
    expect(sut.cron()).toBe(undefined);
    sut.clear();
  });
});
