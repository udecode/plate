import React from 'react';

import type { RuntimePluginReference, Value } from '../../facade';
import type { EditorApplicationSchema } from '../../lib';
import type {
  PlatePluginsFromTuple,
  RuntimePluginsFromTuple,
} from '../../lib/editor/withPlite';
import type { Editor } from './Editor';
import { type CreateEditorOptions, createEditor } from './withPlate';

type UseCreateEditorReturn<TEnabled, TEditor> = TEnabled extends false
  ? null
  : TEnabled extends true | undefined
    ? TEditor
    : TEditor | null;

type UseCreateEditorResult<
  V extends Value,
  TPlugins extends readonly RuntimePluginReference[],
  TSchema,
> = Editor<
  V,
  RuntimePluginsFromTuple<TPlugins>,
  PlatePluginsFromTuple<TPlugins>,
  TSchema
>;

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
 * const editor = useCreateEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   initialValue: [{ type: 'paragraph', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom dependencies
 * const editor = useCreateEditor(
 *   {
 *     plugins: [ParagraphPlugin],
 *     enabled,
 *   },
 *   [enabled]
 * ); // Re-create when enabled changes
 *
 * // Name the schema only when persisted or collaborative state needs lineage.
 * const persistedEditor = useCreateEditor({
 *   schema: { id: 'acme-document', version: 1 },
 * });
 * ```
 *
 * @param options - Configuration options for creating the Plate editor
 * @param deps - Additional dependencies for the useMemo hook (default: [])
 * @see {@link createEditor} for imperative editor creation.
 */
export function useCreateEditor<
  const TInitialValue extends Value,
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
  TEnabled extends boolean | undefined = undefined,
>(
  options: Omit<
    CreateEditorOptions<Value, TPlugins, TSchema>,
    'initialValue'
  > & {
    enabled?: TEnabled;
    initialValue: TInitialValue;
    plugins: TPlugins;
  },
  deps?: React.DependencyList
): UseCreateEditorReturn<
  TEnabled,
  UseCreateEditorResult<TInitialValue, TPlugins, TSchema>
>;
export function useCreateEditor<
  V extends Value = Value,
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
  TEnabled extends boolean | undefined = undefined,
>(
  options: CreateEditorOptions<V, TPlugins, TSchema> & {
    enabled?: TEnabled;
    plugins: TPlugins;
  },
  deps?: React.DependencyList
): UseCreateEditorReturn<TEnabled, UseCreateEditorResult<V, TPlugins, TSchema>>;
export function useCreateEditor<
  V extends Value = Value,
  const TSchema extends EditorApplicationSchema | undefined = undefined,
  TEnabled extends boolean | undefined = undefined,
>(
  options?: CreateEditorOptions<V, readonly [], TSchema> & {
    enabled?: TEnabled;
  },
  deps?: React.DependencyList
): UseCreateEditorReturn<
  TEnabled,
  UseCreateEditorResult<V, readonly [], TSchema>
>;
export function useCreateEditor(
  options: object = {},
  deps: React.DependencyList = []
): unknown {
  const { enabled, ...editorOptions } = options as CreateEditorOptions & {
    enabled?: boolean;
  };

  return React.useMemo(
    () => {
      if (enabled === false) return null;

      const create = createEditor as (options: unknown) => Editor;

      return create(editorOptions);
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] This API intentionally keys editor ownership by id plus caller-supplied dependencies; other option changes configure the owned editor instead of replacing it.
    [editorOptions.id, enabled, ...deps]
  );
}
