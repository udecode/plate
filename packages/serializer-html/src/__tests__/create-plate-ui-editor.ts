import {
  type CreatePlateEditorOptions,
  type PlateEditor,
  createPlateEditor,
} from '@udecode/plate-common';
import { createPlateUI } from 'www/src/lib/plate/create-plate-ui';

/** Create a plate editor with default UI. */
export const createPlateUIEditor = <E extends PlateEditor = PlateEditor>({
  override,
  ...options
}: CreatePlateEditorOptions<E> = {}): E =>
  createPlateEditor<E>({
    ...options,
    override: {
      components: createPlateUI(override?.components),
    },
  });
