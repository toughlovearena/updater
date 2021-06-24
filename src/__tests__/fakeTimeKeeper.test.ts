import { FakeTimeKeeper } from "./__mocks__/fakeTimeKeeper";

describe('FakeTimeKeeper', () => {
  test('basic functionality', () => {
    const sut = new FakeTimeKeeper();
    expect(sut.now()).toBe(0);
    let counter1 = 0;
    let counter2 = 0;
    let interval1 = sut.setCron(() => counter1++, 5);
    let interval2 = sut.setCron(() => counter2++, 7);
    expect(counter1).toBe(0);
    expect(counter2).toBe(0);

    sut._increment(10);
    expect(sut.now()).toBe(10);
    expect(counter1).toBe(2);
    expect(counter2).toBe(1);

    sut._set(50);
    expect(sut.now()).toBe(50);
    expect(counter1).toBe(10);
    expect(counter2).toBe(7);

    sut.clearCron(interval1);

    sut._increment(35);
    expect(sut.now()).toBe(85);
    expect(counter1).toBe(10);
    expect(counter2).toBe(12);
  });
});
