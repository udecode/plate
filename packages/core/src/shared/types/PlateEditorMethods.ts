import type { Value } from '@udecode/slate';

import type { EXPOSED_STORE_KEYS, PlateStoreState } from './PlateStore';

export type PlateEditorMethods<V extends Value = Value> = {
  // Example: editor.plate.set.readOnly(true)
  plate: {
    set: {
      [K in (typeof EXPOSED_STORE_KEYS)[number]]: (
        value: PlateStoreState<V>[K]
      ) => void;
    };
  };
  redecorate: () => void;

  reset: () => void;
};
