import {
  type AnyPlatePlugin,
  type CreatePlateEditorOptions,
  type Value,
  createPlateEditor,
} from '@udecode/plate-common';
import { createPlateUI } from 'www/src/lib/plate/create-plate-ui';

/** Create a plate editor with default UI. */
export const createPlateUIEditor = <
  V extends Value = Value,
  P extends AnyPlatePlugin = CorePlugin,
>({ override, ...options }: CreatePlateEditorOptions<V, P> = {}) =>
  createPlateEditor<V, P>({
    ...options,
    override: {
      components: createPlateUI(override?.components),
    },
  });
