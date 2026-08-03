import React from 'react';

import type { PlateEditor } from './PlateEditor';
import type { BasePluginInput } from '../../lib';

import { type CreatePlateEditorOptions, createPlateEditor } from './withPlate';

type UsePlateEditorReturn<TEnabled, TEditor> = TEnabled extends false
  ? null
  : TEnabled extends true | undefined
    ? TEditor
    : TEditor | null;

type UsePlateEditorResult<TPlugins extends readonly BasePluginInput[]> =
  PlateEditor<TPlugins>;

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
 *   plugins: [ParagraphPlugin, H1Plugin],
 *   initialValue: [{ type: 'paragraph', children: [{ text: 'Hello world!' }] }],
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
 *
 * // Name the schema only when persisted or collaborative state needs lineage.
 * const persistedEditor = usePlateEditor({
 *   schemaIdentity: { id: 'acme-document', version: 1 },
 * });
 * ```
 *
 * @param options - Configuration options for creating the Plate editor
 * @param deps - Additional dependencies for the useMemo hook (default: [])
 * @see {@link createPlateEditor} for detailed information on React editor creation and configuration.
 * @see {@link createBaseEditor} for a non-React version of editor creation.
 * @see {@link createPlateEditor} for the underlying React-specific enhancement function.
 */
export function usePlateEditor<
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  TEnabled extends boolean | undefined = undefined,
>(
  options: CreatePlateEditorOptions<TPlugins> & { enabled?: TEnabled } = {},
  deps: React.DependencyList = []
): UsePlateEditorReturn<TEnabled, UsePlateEditorResult<TPlugins>> {
  const { enabled, ...editorOptions } = options;

  return React.useMemo(
    () => {
      if (enabled === false) return null;

      return createPlateEditor(editorOptions);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorOptions.id, enabled, ...deps]
  ) as UsePlateEditorReturn<TEnabled, UsePlateEditorResult<TPlugins>>;
}
