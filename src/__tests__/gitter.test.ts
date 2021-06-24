import { Gitter } from '../gitter';

describe('Gitter', () => {
  test('hash() returns string', async () => {
    const sut = new Gitter();
    const result = await sut.hash();
    expect(result.length).toBeGreaterThan(3);
  });
});
