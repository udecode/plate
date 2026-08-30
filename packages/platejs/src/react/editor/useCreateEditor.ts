import type {
  EditorExtensionReference,
  EditorExtensionsFromOptions,
  EditorValueFromOptions,
  Value,
} from 'plitejs';
import React from 'react';

import type { BasePluginInput, EditorApplicationSchema } from '../../lib';
import type { Editor } from './Editor';
import { type CreateEditorOptions, createEditor } from './withPlate';

type UseCreateEditorReturn<TEnabled, TEditor> = TEnabled extends false
  ? null
  : TEnabled extends true | undefined
    ? TEditor
    : TEditor | null;

type UseCreateEditorResult<
  V extends Value,
  TExtensions extends readonly EditorExtensionReference[],
  TPlugins extends readonly BasePluginInput[],
  TSchema,
> = Editor<V, TExtensions, TPlugins, TSchema>;

type EditorPluginsFromOptions<TOptions> = TOptions extends {
  plugins: infer TPlugins extends readonly BasePluginInput[];
}
  ? TPlugins
  : readonly [];

type EditorSchemaFromOptions<TOptions> = TOptions extends {
  schema: infer TSchema extends EditorApplicationSchema;
}
  ? TSchema
  : undefined;

type EditorEnabledFromOptions<TOptions> = TOptions extends {
  enabled?: infer TEnabled extends boolean | undefined;
}
  ? TEnabled
  : undefined;

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
  const TOptions extends CreateEditorOptions<
    any,
    readonly EditorExtensionReference[]
  > & {
    enabled?: boolean;
    extensions: readonly EditorExtensionReference[];
  },
>(
  options: TOptions,
  deps?: React.DependencyList
): UseCreateEditorReturn<
  EditorEnabledFromOptions<TOptions>,
  Editor<
    EditorValueFromOptions<TOptions>,
    EditorExtensionsFromOptions<TOptions>,
    EditorPluginsFromOptions<TOptions>,
    EditorSchemaFromOptions<TOptions>
  >
>;
export function useCreateEditor<
  V extends Value,
  const TExtensions extends readonly EditorExtensionReference[],
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
  TEnabled extends boolean | undefined = undefined,
>(
  options: CreateEditorOptions<V, TExtensions, TPlugins, TSchema> & {
    enabled?: TEnabled;
    extensions: TExtensions;
  },
  deps?: React.DependencyList
): UseCreateEditorReturn<
  TEnabled,
  UseCreateEditorResult<V, TExtensions, TPlugins, TSchema>
>;
export function useCreateEditor<
  V extends Value = Value,
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
  TEnabled extends boolean | undefined = undefined,
>(
  options?: CreateEditorOptions<V, readonly [], TPlugins, TSchema> & {
    enabled?: TEnabled;
    extensions?: readonly [];
  },
  deps?: React.DependencyList
): UseCreateEditorReturn<
  TEnabled,
  UseCreateEditorResult<V, readonly [], TPlugins, TSchema>
>;
export function useCreateEditor(
  options: object = {},
  deps: React.DependencyList = []
): unknown {
  const { enabled, ...editorOptions } = options as CreateEditorOptions<
    Value,
    readonly EditorExtensionReference[]
  > & { enabled?: boolean };

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
