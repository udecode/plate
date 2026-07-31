import React from 'react';

import type { Value } from '@platejs/plite';

import {
  type CreatePlateEditorOptions,
  type PlateCorePlugin,
  createPlateEditor,
} from './withPlate';

type UsePlateEditorReturn<TEnabled, TEditor> = TEnabled extends false
  ? null
  : TEnabled extends true | undefined
    ? TEditor
    : TEditor | null;

type UsePlateEditorResult<
  V extends Value,
  TPlugins extends readonly unknown[],
> = ReturnType<typeof createPlateEditor<V, TPlugins>>;

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
 *   initialValue: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
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
 * @see {@link extendPlateEditor} for the underlying React-specific enhancement function.
 */
export function usePlateEditor<V extends Value = Value>(): UsePlateEditorResult<
  V,
  readonly PlateCorePlugin[]
>;

export function usePlateEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly PlateCorePlugin[],
  TEnabled extends boolean | undefined = undefined,
>(
  options: CreatePlateEditorOptions<V, TPlugins> & { enabled?: TEnabled },
  deps?: React.DependencyList
): UsePlateEditorReturn<TEnabled, UsePlateEditorResult<V, TPlugins>>;

export function usePlateEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly PlateCorePlugin[],
  TEnabled extends boolean | undefined = undefined,
>(
  options: CreatePlateEditorOptions<V, TPlugins> & { enabled?: TEnabled } = {},
  deps: React.DependencyList = []
): UsePlateEditorReturn<TEnabled, UsePlateEditorResult<V, TPlugins>> {
  const { enabled, ...editorOptions } = options;

  return React.useMemo(
    () => {
      if (enabled === false) return null;

      return createPlateEditor(editorOptions);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editorOptions.id, enabled, ...deps]
  ) as UsePlateEditorReturn<TEnabled, UsePlateEditorResult<V, TPlugins>>;
}
