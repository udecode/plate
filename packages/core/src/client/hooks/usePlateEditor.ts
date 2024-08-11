import React from 'react';

import type { Value } from '@udecode/slate';

import type { AnyPlatePlugin } from '../../shared';

import {
  type CreatePlateEditorOptions,
  createPlateEditor,
} from '../utils/createPlateEditor';

/**
 * Creates and memoizes a Plate editor instance.
 *
 * @param {CreatePlateEditorOptions} options - Configuration options for
 *   creating the Plate editor.
 * @param {React.DependencyList} [deps=[]] - Additional dependencies for the
 *   useMemo hook, in addition to `options.id`. Default is `[]`
 */
export function usePlateEditor<
  V extends Value = Value,
  P extends AnyPlatePlugin = AnyPlatePlugin,
>(
  options: CreatePlateEditorOptions<V, P> = {},
  deps: React.DependencyList = []
) {
  return React.useMemo(
    () => createPlateEditor<V, P>(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.id, ...deps]
  );
}
