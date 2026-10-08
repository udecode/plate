import React from 'react';

import type { RuntimePluginReference, Value } from '../../facade';
import type { EditorApplicationSchema } from '../../lib';
import { resolveEditorUserId } from '../../lib/editor/editorUser.internal';
import {
  assertConstructorOptions,
  type PlatePluginsFromTuple,
  type RuntimePluginsFromTuple,
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
 * A change of `id`, or of the user that `userId` names, creates a new editor
 * from the options of that render; a missing, empty or `'local'` `userId` all
 * name the local user. The old editor's unsaved document and comments are
 * dropped, so pass them in as the new editor's initial value and comments.
 * A new editor cannot bind a `rootName` in a `Y.Doc` that the old editor still
 * holds.
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
  assertConstructorOptions(options);
  const { enabled, ...editorOptions } = options as CreateEditorOptions & {
    enabled?: boolean;
  };
  const userKey = resolveEditorUserId(editorOptions.userId);

  return React.useMemo(
    () => {
      if (enabled === false) return null;

      const create = createEditor as (options: unknown) => Editor;

      return create(editorOptions);
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- [P0 behavior-boundary] The editor is keyed by id, user, enabled and caller-supplied dependencies; other option changes keep the current editor.
    [editorOptions.id, userKey, enabled, ...deps]
  );
}
