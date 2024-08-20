import React from 'react';

import type { Value } from '@udecode/slate';

import type { AnyPluginConfig } from '../../lib';

import {
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
  createPlateEditor,
} from '../editor';

/**
 * A memoized version of createPlateEditor for use in React components.
 *
 * @param {CreatePlateEditorOptions} options - Configuration options for
 *   creating the Plate editor.
 * @param {React.DependencyList} [deps=[]] - Additional dependencies for the
 *   useMemo hook, in addition to `options.id`. Default is `[]`
 * @see {@link createPlateEditor} for detailed information on React editor creation and configuration.
 * @see {@link createSlateEditor} for a non-React version of editor creation.
 * @see {@link withPlate} for the underlying React-specific enhancement function.
 */
export function usePlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
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
