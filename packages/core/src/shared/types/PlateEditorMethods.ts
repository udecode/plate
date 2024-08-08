import type { EXPOSED_STORE_KEYS, PlateStoreState } from './PlateStore';

export type PlateEditorMethods = {
  // Example: editor.plate.set.readOnly(true)
  plate: {
    set: {
      [K in (typeof EXPOSED_STORE_KEYS)[number]]: (
        value: PlateStoreState[K]
      ) => void;
    };
  };
  redecorate: () => void;

  reset: () => void;
};
