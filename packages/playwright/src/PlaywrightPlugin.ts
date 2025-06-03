import { KEYS } from '@udecode/plate';
import { createPlatePlugin } from '@udecode/plate/react';

import { usePlaywrightAdapter } from './usePlaywrightAdapter';

export const PlaywrightPlugin = createPlatePlugin({
  key: KEYS.playwright,
  useHooks: usePlaywrightAdapter,
});
