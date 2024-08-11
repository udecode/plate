import { type TEditor, type Value, createTEditor } from '@udecode/slate';

import type { AnyPlatePlugin } from '../../shared';

import { type WithPlateOptions, withPlate } from '../plugins/withPlate';

export type CreatePlateEditorOptions<
  V extends Value = Value,
  P extends AnyPlatePlugin = AnyPlatePlugin,
> = {
  /**
   * Initial editor to be extended with `withPlate`.
   *
   * @default createEditor()
   */
  editor?: TEditor;
} & WithPlateOptions<V, P>;

/**
 * Create a plate editor with:
 *
 * - `createTEditor` or custom `editor`
 * - `withPlate`
 * - Custom `components`
 */
export const createPlateEditor = <
  V extends Value = Value,
  P extends AnyPlatePlugin = AnyPlatePlugin,
>({
  editor = createTEditor(),
  ...options
}: CreatePlateEditorOptions<V, P> = {}) => {
  return withPlate<V, P>(editor, options);
};
