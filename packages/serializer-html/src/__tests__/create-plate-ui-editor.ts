import type {
  AnyPlatePlugin,
  CorePlugin,
  CreateSlateEditorOptions,
  Value,
} from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { createPlateUI } from 'www/src/lib/plate/create-plate-ui';

/** Create a plate editor with default UI. */
export const createPlateUIEditor = <
  V extends Value = Value,
  P extends AnyPlatePlugin = CorePlugin,
>({ override, ...options }: CreateSlateEditorOptions<V, P> = {}) =>
  createPlateEditor<V, P>({
    ...options,
    override: {
      components: createPlateUI(override?.components),
    },
  });
