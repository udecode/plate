import React from 'react';

import type { Value } from '@platejs/slate';

import type { AnyPluginConfig } from '../../lib';

import {
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
  type TPlateEditor,
  createPlateEditor,
} from '../editor';

/**
 * Creates a memoized Plate editor for React components.
 *
 * This hook creates a fully configured Plate editor instance that is memoized
 * based on the provided dependencies. It's optimized for React components to
 * prevent unnecessary re-creation of the editor on every render.
 *
 * Examples:
 *
 * ```ts
 * const editor = usePlateEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   value: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom dependencies
 * const editor = usePlateEditor(
 *   {
 *     plugins: [ParagraphPlugin],
 *     enabled,
 *   },
 *   [enabled]
 * ); // Re-create when enabled changes
 * ```
 *
 * @param options - Configuration options for creating the Plate editor
 * @param deps - Additional dependencies for the useMemo hook (default: [])
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
  return React.useMemo(
    (): any => {
      if (options.enabled === false) return null;

      const editor = createPlateEditor(options);

      return editor;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.id, options.enabled, ...deps]
  );
}
