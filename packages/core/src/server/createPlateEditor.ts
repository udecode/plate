import { type Value, createTEditor } from '@udecode/slate';

import type { CreatePlateEditorOptions } from '../client/utils/createPlateEditor';
import type { AnyPlatePlugin } from '../shared';

import { withPlate } from './withPlate';

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
