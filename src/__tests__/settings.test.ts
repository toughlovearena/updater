import { SettingsSingleton } from '../settings';

describe('settings.ts', () => {
  let _env: Record<string, string> = {};
  let _config: Record<string, string> = {};

  class TestableSettings extends SettingsSingleton {
    protected env(varName: string) {
      return _env[varName] ?? super.env(varName);
    }
    protected config(varName: string) {
      return _config[varName] ?? super.config(varName);
    }
  }

  beforeEach(() => {
    _env = {};
    _config = {};
  });

  test('order of priority', () => {
    expect(new TestableSettings().bashBuild).toBe('npm run build');

    _config = {'bashBuild': 'foo',};
    expect(new TestableSettings().bashBuild).toBe('foo');

    _env = {'UPDATER_BASH_BUILD': 'bar',};
    expect(new TestableSettings().bashBuild).toBe('bar');

    _env = {};
    expect(new TestableSettings().bashBuild).toBe('foo');
  });
});
