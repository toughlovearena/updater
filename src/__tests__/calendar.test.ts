import { TuesdayAfterMidnightCalendar } from "../calendar";
import { FakeTimeKeeper } from "./__mocks__/fakeTimeKeeper";

describe('Calendar', () => {
  let timeKeeper: FakeTimeKeeper;
  let sut: TuesdayAfterMidnightCalendar;
  beforeEach(() => {
    timeKeeper = new FakeTimeKeeper();
    sut = new TuesdayAfterMidnightCalendar(timeKeeper);
  });

  test('isInShutdownWindow()', () => {
    const mondayEvening = '2021-10-11T02:52:16.624Z';
    timeKeeper._set(new Date(mondayEvening).getTime());
    expect(sut.isInShutdownWindow()).toBe(false);

    const tuesdayAfterMidnight = '2021-10-12T06:52:16.624Z';
    timeKeeper._set(new Date(tuesdayAfterMidnight).getTime());
    expect(sut.isInShutdownWindow()).toBe(true);

    const tuesdayAfternoon = '2021-10-12T18:52:16.624Z';
    timeKeeper._set(new Date(tuesdayAfternoon).getTime());
    expect(sut.isInShutdownWindow()).toBe(false);

    const wednesdayAfterMidnight = '2021-10-13T06:52:16.624Z';
    timeKeeper._set(new Date(wednesdayAfterMidnight).getTime());
    expect(sut.isInShutdownWindow()).toBe(false);

    const farMondayEvening = '2021-10-25T02:52:16.624Z';
    timeKeeper._set(new Date(farMondayEvening).getTime());
    expect(sut.isInShutdownWindow()).toBe(false);

    const farTuesdayAfterMidnight = '2021-10-26T06:52:16.624Z';
    timeKeeper._set(new Date(farTuesdayAfterMidnight).getTime());
    expect(sut.isInShutdownWindow()).toBe(true);
  });
});
