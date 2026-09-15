import {
  createEditor as createPliteEditor,
  type Editor as RuntimeEditor,
  type RuntimePluginReference,
  type Value,
} from '../../facade';
import type { GeneratedEditorValue } from '../../internal/editor/generatedEditorTypes';
import type { EditorApplicationSchema, EditorValueInput } from '../../lib';
import {
  applyEditor,
  type EditorOptions as HeadlessEditorOptions,
  type PlatePluginsFromTuple,
  type RuntimePluginsFromTuple,
} from '../../lib/editor/withPlite';
import type { Shortcuts, PluginDefinitionInput } from '../plugin';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';
import type {
  InferEditorPlugins,
  InferPlateEditorSchemaPlugins,
  InternalReactEditorMutationProvider,
  InternalReactEditorWithInstalledPlugins,
  Editor,
} from './Editor';
import { getPlateCorePlugins } from './getPlateCorePlugins.internal';

type PluginInput = RuntimePluginReference;

export type InferPlateEditorValue<TPlugins> = GeneratedEditorValue<TPlugins>;

export type { InferEditorPlugins } from './Editor';

type ReactEditorOptions<
  V extends Value = Value,
  TPlugins extends readonly RuntimePluginReference[] = readonly PluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = Omit<HeadlessEditorOptions<TPlugins>, 'id' | 'plugins' | 'schema'> &
  Omit<
    Partial<
      Pick<
        PluginDefinitionInput,
        | 'decorate'
        | 'inject'
        | 'on'
        | 'initialState'
        | 'override'
        | 'render'
        | 'shortcuts'
      >
    >,
    'shortcuts'
  > & {
    /** Root editor API declarations for the synthetic root plugin. */
    api?: PluginDefinitionInput['api'];
    /**
     * Configuration for the built-in navigation feedback plugin.
     *
     * This React plugin flashes the landed target after navigation jumps such as
     * TOC, footnote, search, or custom outline movement.
     *
     * @default { duration: 1600 }
     */
    navigationFeedback?: Partial<NavigationFeedbackPluginState> | boolean;
    shortcuts?: Shortcuts;
    initialValue?:
      | ((context: {
          editor: Editor<V, TPlugins, PlatePluginsFromTuple<TPlugins>, TSchema>;
        }) => EditorValueInput<NoInfer<V>>)
      | EditorValueInput<NoInfer<V>>;
    plugins?: TPlugins;
    schema?: TSchema;
  };

export const applyPlateEditor = <
  V extends Value = Value,
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
  E extends RuntimeEditor = RuntimeEditor,
>(
  e: E,
  options: ReactEditorOptions<V, TPlugins, TSchema>
): InternalReactEditorWithInstalledPlugins<
  V,
  InferEditorPlugins<PlatePluginsFromTuple<TPlugins>>,
  InternalReactEditorMutationProvider<
    PlatePluginsFromTuple<TPlugins>,
    InferPlateEditorSchemaPlugins<PlatePluginsFromTuple<TPlugins>>,
    TSchema
  >,
  RuntimePluginsFromTuple<TPlugins>
> => {
  const { navigationFeedback, plugins = [], readOnly, ...rest } = options;
  const combinedPlugins = [
    ...getPlateCorePlugins({ navigationFeedback }),
    ...plugins,
  ];

  const editor = applyEditor(
    e,
    {
      readOnly,
      ...rest,
      plugins: combinedPlugins,
    } as unknown as Parameters<typeof applyEditor>[1],
    false
  );

  return editor as unknown as InternalReactEditorWithInstalledPlugins<
    V,
    InferEditorPlugins<PlatePluginsFromTuple<TPlugins>>,
    InternalReactEditorMutationProvider<
      PlatePluginsFromTuple<TPlugins>,
      InferPlateEditorSchemaPlugins<PlatePluginsFromTuple<TPlugins>>,
      TSchema
    >,
    RuntimePluginsFromTuple<TPlugins>
  >;
};

type CreateEditorOptionsForValue<
  V extends Value,
  TPlugins extends readonly RuntimePluginReference[],
  TSchema extends EditorApplicationSchema | undefined,
> = Partial<Omit<ReactEditorOptions<V, TPlugins, TSchema>, 'plugins'>> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /** Existing editor to enhance instead of allocating a new editor. */
  editor?: RuntimeEditor<any, any>;
  plugins?: TPlugins;
};

export type CreateEditorOptions<
  V extends Value = Value,
  TPlugins extends readonly RuntimePluginReference[] = readonly PluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = CreateEditorOptionsForValue<V, TPlugins, TSchema>;

export function createEditorWithEditor<
  V extends Value = Value,
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  editor: RuntimeEditor<any, any>,
  options: CreateEditorOptions<V, TPlugins, TSchema> = {}
): Editor<
  V,
  RuntimePluginsFromTuple<TPlugins>,
  PlatePluginsFromTuple<TPlugins>,
  TSchema
> {
  const { id: _id, ...editorOptions } = options;
  const apply = applyPlateEditor as unknown as (
    editor: RuntimeEditor,
    options: unknown
  ) => unknown;

  return apply(editor, editorOptions) as any;
}

/**
 * Creates a Plate editor (React version).
 *
 * This function creates a fully configured Plate editor instance with
 * React-specific enhancements including component rendering, event handlers,
 * and hooks integration. It applies all specified plugins and configurations to
 * create a functional editor.
 *
 * Examples:
 *
 * ```ts
 * const editor = createEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   initialValue: [{ type: 'paragraph', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom components
 * const editor = createEditor({
 *   plugins: [
 *     ParagraphPlugin.configure({ component: ParagraphElement }),
 *     CodePlugin.configure({ component: CodeLeaf }),
 *   ],
 * });
 *
 * // Editor with React-specific options
 * const editor = createEditor({
 *   plugins: [ParagraphPlugin],
 *   on: { keyDown: customKeyHandler },
 * });
 *
 * // Name the schema only when persisted or collaborative state needs lineage.
 * const persistedEditor = createEditor({
 *   schema: { id: 'acme-document', version: 1 },
 * });
 * ```
 *
 * @see {@link createEditor} for a non-React version of editor creation.
 * @see {@link useCreateEditor} for a memoized version in React components.
 */
export function createEditor<
  const TInitialValue extends Value,
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: Omit<
    CreateEditorOptions<Value, TPlugins, TSchema>,
    'initialValue'
  > & {
    initialValue: TInitialValue;
    plugins: TPlugins;
  }
): Editor<
  TInitialValue,
  RuntimePluginsFromTuple<TPlugins>,
  PlatePluginsFromTuple<TPlugins>,
  TSchema
>;
export function createEditor<
  V extends Value = Value,
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateEditorOptions<V, TPlugins, TSchema> & { plugins: TPlugins }
): Editor<
  V,
  RuntimePluginsFromTuple<TPlugins>,
  PlatePluginsFromTuple<TPlugins>,
  TSchema
>;
export function createEditor<
  V extends Value = Value,
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options?: CreateEditorOptions<V, readonly [], TSchema>
): Editor<V, readonly [], readonly [], TSchema>;

export function createEditor(options: unknown = {}): unknown {
  const resolvedOptions = options as CreateEditorOptionsForValue<
    Value,
    readonly RuntimePluginReference[],
    EditorApplicationSchema | undefined
  >;
  const { editor: inputEditor, id, ...editorOptions } = resolvedOptions;
  const editor =
    inputEditor ??
    createPliteEditor({
      id,
      lifecycleErrorSink: resolvedOptions.lifecycleErrorSink,
      maxLength: resolvedOptions.maxLength,
      readOnly: resolvedOptions.readOnly,
    });

  return applyPlateEditor<
    Value,
    readonly RuntimePluginReference[],
    EditorApplicationSchema | undefined,
    RuntimeEditor<Value, any>
  >(editor as RuntimeEditor<Value, any>, editorOptions);
}
