import { CanGit } from '../../gitter';

interface StatusCallback {
  resolve(changes: boolean): void;
  reject(reason?: any): void;
}

export class FakeGitter implements CanGit {
  pendingStatus: StatusCallback[] = [];
  async hasChanged() {
    return new Promise<boolean>((resolve, reject) => {
      this.pendingStatus.push({
        resolve,
        reject,
      });
    });
  }
  async hash(): Promise<string> {
    throw new Error('hash() not implemented');
  }
  async pull(): Promise<void> {
    throw new Error('pull() not implemented');
  }
}
