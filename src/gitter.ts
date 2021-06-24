import simpleGit from "simple-git";

export interface CanGit {
  hasChanged(): Promise<boolean>;
  hash(): Promise<string>;
  pull(): Promise<void>;
}

export class Gitter implements CanGit {
  private readonly sg = simpleGit();

  async hasChanged(): Promise<boolean> {
    await this.sg.fetch();
    const status = await this.sg.status();
    return status.behind > 0;
  }
  async hash(): Promise<string> {
    const log = await this.sg.log();
    return log.latest?.hash ?? '???';
  }
  async pull(): Promise<void> {
    await this.sg.pull();
  }
}
