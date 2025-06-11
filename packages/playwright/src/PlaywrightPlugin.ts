import { KEYS } from 'platejs';
import { createPlatePlugin } from 'platejs/react';

import { usePlaywrightAdapter } from './usePlaywrightAdapter';

export const PlaywrightPlugin = createPlatePlugin({
  key: KEYS.playwright,
  useHooks: usePlaywrightAdapter,
});
