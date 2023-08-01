import { Value } from '@udecode/slate';

import { SetRecord } from '../atoms';
import { EXPOSED_STORE_KEYS, PlateStoreState } from './PlateStore';

export type PlateEditorMethods<V extends Value = Value> = {
  reset: () => void;
  redecorate: () => void;

  // Example: editor.plate.set.readOnly(true)
  plate: {
    set: {
      [K in (typeof EXPOSED_STORE_KEYS)[number]]: ReturnType<
        SetRecord<PlateStoreState<V>>[K]
      >;
    };
  };
};
