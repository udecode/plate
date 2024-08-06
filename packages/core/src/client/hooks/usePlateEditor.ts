import React from 'react';

import type { PlateEditor } from '../../shared';

import {
  type CreatePlateEditorOptions,
  createPlateEditor,
} from '../utils/createPlateEditor';

/**
 * Creates and memoizes a Plate editor instance.
 *
 * @param {CreatePlateEditorOptions<E>} options - Configuration options for
 *   creating the Plate editor.
 * @param {React.DependencyList} [deps=[]] - Additional dependencies for the
 *   useMemo hook, in addition to `options.id`. Default is `[]`
 * @returns {E & PlateEditor<V>} - The created Plate editor instance.
 */
export function usePlateEditor<E extends PlateEditor = PlateEditor>(
  options: CreatePlateEditorOptions<E>,
  deps: React.DependencyList = []
): E {
  return React.useMemo(
    () => createPlateEditor<E>(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.id, ...deps]
  );
}
