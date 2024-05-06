import {
  type TEditor,
  type Value,
  createTEditor,
  normalizeEditor,
} from '@udecode/slate';

import type { CreatePlateEditorOptions } from '../client/utils/createPlateEditor';
import type { PlateEditor } from '../shared/types/PlateEditor';

import { createPlugins } from '../shared/utils/createPlugins';
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
  E extends TEditor<V> = TEditor<V>,
>({
  components,
  editor = createTEditor() as E,
  normalizeInitialValue: shouldNormalizeInitialValue,
  overrideByKey,
  plugins = [],
  ...withPlateOptions
}: CreatePlateEditorOptions<V, E> = {}): E & PlateEditor<V> => {
  plugins = createPlugins(plugins, {
    components,
    overrideByKey,
  });

  const e = withPlate<V>(editor, {
    plugins,
    ...withPlateOptions,
  }) as E & PlateEditor<V>;

  if (shouldNormalizeInitialValue) {
    normalizeEditor(e, { force: true });
  }

  return e;
};
