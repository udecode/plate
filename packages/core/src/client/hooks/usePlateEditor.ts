import React from 'react';

import type { TEditor, Value } from '@udecode/slate';

import type { PlateEditor } from '../../shared';

import {
  type CreatePlateEditorOptions,
  createPlateEditor,
} from '../utils/createPlateEditor';

/**
 * Creates and memoizes a Plate editor instance.
 *
 * @template V - The type of value used in the editor, extends Value.
 * @template E - The type of editor, extends TEditor<V>.
 * @param {CreatePlateEditorOptions<V, E>} options - Configuration options for
 *   creating the Plate editor.
 * @param {React.DependencyList} [deps=[]] - Additional dependencies for the
 *   useMemo hook, in addition to `options.id`. Default is `[]`
 * @returns {E & PlateEditor<V>} - The created Plate editor instance.
 */
export function usePlateEditor<
  V extends Value = Value,
  E extends TEditor<V> = TEditor<V>,
>(
  options: CreatePlateEditorOptions<V, E>,
  deps: React.DependencyList = []
): E & PlateEditor<V> {
  return React.useMemo(
    () => createPlateEditor<V, E>(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.id, ...deps]
  );
}
