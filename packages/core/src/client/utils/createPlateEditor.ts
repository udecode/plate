import { type TEditor, type Value, createTEditor } from '@udecode/slate';

import type { PlateEditor } from '../../shared/types/PlateEditor';

import { type WithPlateOptions, withPlate } from '../plugins/withPlate';

export type CreatePlateEditorOptions<
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
> = {
  /** Initial editor (without `withPlate`). */
  editor?: E;
} & WithPlateOptions<V>;

/**
 * Create a plate editor with:
 *
 * - `createTEditor` or custom `editor`
 * - `withPlate`
 * - Custom `components`
 */
export const createPlateEditor = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
>({
  editor = createTEditor() as E,
  ...options
}: CreatePlateEditorOptions<V, E> = {}): E & PlateEditor<V> => {
  return withPlate<V>(editor, options) as E & PlateEditor<V>;
};
