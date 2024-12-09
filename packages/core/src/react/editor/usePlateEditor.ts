import type React from 'react';

import type { Value } from '@udecode/slate';

import { useMemoOnce } from '@udecode/react-utils';

import type { AnyPluginConfig } from '../../lib';

import {
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
  type TPlateEditor,
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
  TEnabled extends boolean | undefined = undefined,
>(
  options: CreatePlateEditorOptions<V, P> & { enabled?: TEnabled } = {},
  deps: React.DependencyList = []
): TEnabled extends false
  ? null
  : TEnabled extends true | undefined
    ? TPlateEditor<V, P>
    : TPlateEditor<V, P> | null {
  return useMemoOnce(
    (): any => {
      if (options.enabled === false) return null;

      const editor = createPlateEditor(options);

      return editor;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.id, options.enabled, ...deps]
  );
}
