import { createTEditor, normalizeEditor, TEditor, Value } from '@udecode/slate';

import { PlateEditor } from '../shared/types/PlateEditor';
import { createPlugins } from '../shared/utils/createPlugins';
import { withPlate } from './withPlate';

import type { CreatePlateEditorOptions } from '../client/utils/createPlateEditor';

/**
 * Create a plate editor with:
 * - `createTEditor` or custom `editor`
 * - `withPlate`
 * - custom `components`
 */
export const createPlateEditor = <
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
>({
  editor = createTEditor() as E,
  plugins = [],
  components,
  overrideByKey,
  normalizeInitialValue: shouldNormalizeInitialValue,
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
