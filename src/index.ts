export * from './updater';

import { rebuild } from './rebuild';

if (require.main === module) {
  // tslint:disable-next-line:no-console
  console.log('Running @toughlovearena/updater');
  rebuild();
}
