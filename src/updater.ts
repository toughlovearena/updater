import * as childProcess from 'child_process';
import simpleGit, { SimpleGit } from 'simple-git';

export interface UpdaterOptions {
  timeout?: number;
}

export class Updater {
  static readonly defaultTimeout = 30 * 1000; // 30 seconds

  readonly timeout: number;
  private rebuilding = false;
  private interval: NodeJS.Timeout | undefined;

  constructor(options?: UpdaterOptions) {
    this.timeout = options?.timeout ?? Updater.defaultTimeout;
  }

  protected async status(): Promise<boolean> {
    const sg: SimpleGit = simpleGit();
    await sg.fetch();
    const status = await sg.status();
    return status.behind > 0;
  }
  protected async update(): Promise<void> {
    return new Promise<void>((resolve) => {
      // tslint:disable-next-line:no-console
      console.log(`Updater: found new code, triggering update`);
      try {
        const emitter = childProcess.spawn('npx @toughlovearena/updater', {
          detached: true,
        });
        emitter.on('close', resolve);
        emitter.on('disconnect', resolve);
        emitter.on('error', resolve);
        emitter.on('exit', resolve);
      } catch (err) {
        // swallow error, continue
        resolve();
      }
    });
  }

  async run() {
    if (this.rebuilding) {
      return;
    }

    const changes = await this.status();

    if (this.rebuilding) {
      return;
    }

    if (changes) {
      this.clear();
      this.rebuilding = true;
      await this.update();
    }
  }

  clear() {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
    this.interval = undefined;
  }
  isRunning() {
    return this.interval !== undefined;
  }
  cron() {
    this.clear();
    this.interval = setInterval(() => this.run(), this.timeout);
  }
}
