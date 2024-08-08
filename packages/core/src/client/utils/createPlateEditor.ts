import { type TEditor, createTEditor } from '@udecode/slate';

import type { PlateEditor } from '../../shared/types/PlateEditor';

import { type WithPlateOptions, withPlate } from '../plugins/withPlate';

export type CreatePlateEditorOptions<E extends PlateEditor = PlateEditor> = {
  /**
   * Initial editor to be extended with `withPlate`.
   *
   * @default createEditor()
   */
  editor?: TEditor;
} & WithPlateOptions<E>;

/**
 * Create a plate editor with:
 *
 * - `createTEditor` or custom `editor`
 * - `withPlate`
 * - Custom `components`
 */
export const createPlateEditor = <E extends PlateEditor = PlateEditor>({
  editor = createTEditor(),
  ...options
}: CreatePlateEditorOptions<E> = {}): E => {
  return withPlate<E>(editor, options);
};
