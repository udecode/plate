import type { EXPOSED_STORE_KEYS, PlateStoreState } from '../types';

import { createPlugin } from '../plugin';
import { DebugPlugin } from './debug';

export const PlateApiPlugin = createPlugin({
  dependencies: [DebugPlugin.key],
  key: 'plateApi',
}).extendApi(({ editor }) => ({
  plate: {
    set: {} as {
      [K in (typeof EXPOSED_STORE_KEYS)[number]]: (
        value: PlateStoreState[K]
      ) => void;
    },
  },
  redecorate: () => {
    editor.api.debug.warn(
      `editor.api.redecorate should have been overridden but was not. Please report this issue here: https://github.com/udecode/plate/issues`,
      'OVERRIDE_MISSING'
    );
  },
}));
