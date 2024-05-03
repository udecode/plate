import {
  type CreatePlateEditorOptions,
  type PlateEditor,
  type TEditor,
  type Value,
  createPlateEditor,
} from '@udecode/plate-common';

import { createPlateUI } from './create-plate-ui';

/** Create a plate editor with default UI. */
export const createPlateUIEditor = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
>({ components, ...options }: CreatePlateEditorOptions<V, E> = {}): E &
  PlateEditor<V> =>
  createPlateEditor<V, E>({
    ...options,
    components: createPlateUI(components),
  });
