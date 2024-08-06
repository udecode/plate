import { createTEditor } from '@udecode/slate';

import type { CreatePlateEditorOptions } from '../client/utils/createPlateEditor';
import type { PlateEditor } from '../shared/types/PlateEditor';

import { withPlate } from './withPlate';

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
