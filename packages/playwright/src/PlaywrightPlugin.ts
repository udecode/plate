import { createPlatePlugin } from '@udecode/plate/react';

import { usePlaywrightAdapter } from './usePlaywrightAdapter';

export const PlaywrightPlugin = createPlatePlugin({
  key: 'PlaywrightPlugin',
  useHooks: usePlaywrightAdapter,
});
