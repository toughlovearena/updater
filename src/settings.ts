import * as fs from 'fs';

export class SettingsSingleton {
  private loaded = false;
  private configFile: any;

  readonly bashBuild = this.read({
    envVar: 'UPDATER_BASH_BUILD',
    configKey: 'bashBuild',
    defaultValue: 'npm run build',
  });
  readonly nodeScript = this.read({
    envVar: 'UPDATER_NODE_SCRIPT',
    configKey: 'nodeScript',
    defaultValue: 'dist/index.js',
  });

  private read(args: { envVar: string; configKey: string; defaultValue: string }): string {
    return this.env(args.envVar) ?? this.config(args.configKey) ?? args.defaultValue;
  }
  protected env(varName: string): string | null {
    return process.env[varName] || null;
  }
  protected config(key: string): string | null {
    if (!this.loaded) {
      this.loaded = true;
      try {
        const file = fs.readFileSync('updaterconfig.json');
        this.configFile = JSON.parse(file.toString());
      } catch (err) {
        // its ok, configFile is optional
      }
    }
    if (this.configFile) {
      return this.configFile[key] || null;
    }
    return null;
  }
}

export const SETTINGS = new SettingsSingleton();
