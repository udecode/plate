import type { EXPOSED_STORE_KEYS, PlateStoreState } from '../stores';

import { createPlatePlugin } from '../plugin';

export const PlateApiPlugin = createPlatePlugin({
  dependencies: ['debug'],
  key: 'plateApi',
}).extendApi(({ editor }) => ({
  redecorate: () => {
    editor.api.debug.warn(
      `The method editor.api.redecorate() has not been overridden. ` +
        `This may cause unexpected behavior. Please ensure that all required editor methods are properly defined.`,
      'OVERRIDE_MISSING'
    );
  },
  setStoreValue: {} as {
    [K in (typeof EXPOSED_STORE_KEYS)[number]]: (
      value: PlateStoreState<any>[K]
    ) => void;
  },
}));
