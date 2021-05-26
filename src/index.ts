export * from './updater';

import { rebuild } from './rebuild';

if (require.main === module) {
  rebuild();
}
