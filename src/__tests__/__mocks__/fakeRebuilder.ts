import { CanRebuild } from "../../rebuild";

interface UpdateCallback {
  resolve(): void;
  reject(reason?: any): void;
}

export class FakeRebuilder implements CanRebuild {
  pendingUpdate: UpdateCallback[] = [];
  async run() {
    return new Promise<void>((resolve, reject) => {
      this.pendingUpdate.push({
        resolve,
        reject,
      });
    });
  }
}
