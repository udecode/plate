import {
  createEditor as createPliteEditor,
  type Editor as PliteEditor,
  type EditorExtensionReference,
  type EditorExtensionsFromOptions,
  type EditorValueFromOptions,
  type Value,
} from '../../facade';
import type { GeneratedEditorValue } from '../../internal/editor/generatedEditorTypes';
import type {
  BasePluginInput,
  EditorApplicationSchema,
  EditorValueInput,
} from '../../lib';
import {
  applyEditor,
  type EditorOptions as HeadlessEditorOptions,
} from '../../lib/editor/withPlite';
import type { Shortcuts, PlatePluginDefinitionInput } from '../plugin';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';
import type {
  InferPlateEditorPlugins,
  InferPlateEditorSchemaPlugins,
  InternalPlateEditorMutationProvider,
  InternalPlateEditorWithInstalledPlugins,
  Editor,
} from './Editor';
import { getPlateCorePlugins } from './getPlateCorePlugins';

export type { PlateCorePlugin } from './getPlateCorePlugins';

type PlatePluginInput = BasePluginInput;

export type InferPlateEditorValue<TPlugins> = GeneratedEditorValue<TPlugins>;

export type { InferPlateEditorPlugins } from './Editor';

type ReactEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly EditorExtensionReference[] = readonly [],
  TPlugins extends readonly unknown[] = readonly PlatePluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = Omit<HeadlessEditorOptions<TExtensions>, 'id' | 'plugins' | 'schema'> &
  Omit<
    Partial<
      Pick<
        PlatePluginDefinitionInput,
        | 'decorate'
        | 'inject'
        | 'on'
        | 'initialState'
        | 'override'
        | 'render'
        | 'shortcuts'
        | 'useHooks'
      >
    >,
    'shortcuts'
  > & {
    /** Root editor API declarations for the synthetic root plugin. */
    api?: PlatePluginDefinitionInput['api'];
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
    // override?: {
    //   /** Enable or disable plugins */
    //   enabled?: Partial<Record<string, boolean>>;
    //   plugins?: Partial<
    //     Record<
    //       string,
    //       Partial<ResolvedPlatePlugin<AnyBasePluginDefinition>>
    //     >
    //   >;
    // };
    initialValue?:
      | ((context: {
          editor: Editor<V, TExtensions, TPlugins, TSchema>;
        }) => EditorValueInput<NoInfer<V>>)
      | EditorValueInput<NoInfer<V>>;
    plugins?: TPlugins;
    schema?: TSchema;
  };

export const applyPlateEditor = <
  V extends Value = Value,
  const TExtensions extends readonly EditorExtensionReference[] = readonly [],
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
  E extends PliteEditor = PliteEditor,
>(
  e: E,
  options: ReactEditorOptions<V, TExtensions, TPlugins, TSchema>
): InternalPlateEditorWithInstalledPlugins<
  V,
  InferPlateEditorPlugins<TPlugins>,
  InternalPlateEditorMutationProvider<
    TPlugins,
    InferPlateEditorSchemaPlugins<TPlugins>,
    TSchema
  >,
  TExtensions
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

  return editor as unknown as InternalPlateEditorWithInstalledPlugins<
    V,
    InferPlateEditorPlugins<TPlugins>,
    InternalPlateEditorMutationProvider<
      TPlugins,
      InferPlateEditorSchemaPlugins<TPlugins>,
      TSchema
    >,
    TExtensions
  >;
};

type CreateEditorOptionsForValue<
  V extends Value,
  TExtensions extends readonly EditorExtensionReference[],
  TPlugins extends readonly unknown[],
  TSchema extends EditorApplicationSchema | undefined,
> = Partial<
  Omit<
    ReactEditorOptions<V, TExtensions, NoInfer<TPlugins>, TSchema>,
    'plugins'
  >
> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /** Existing Plite editor to enhance instead of allocating a new editor. */
  editor?: PliteEditor<any, any>;
  plugins?: TPlugins;
};

export type CreateEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly EditorExtensionReference[] = readonly [],
  TPlugins extends readonly unknown[] = readonly PlatePluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = CreateEditorOptionsForValue<V, TExtensions, TPlugins, TSchema>;

export function createEditorWithEditor<
  V extends Value = Value,
  const TExtensions extends readonly EditorExtensionReference[] = readonly [],
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  editor: PliteEditor<any, any>,
  options: CreateEditorOptions<V, TExtensions, TPlugins, TSchema> = {}
): Editor<V, TExtensions, TPlugins, TSchema> {
  const { id: _id, ...editorOptions } = options;
  const apply = applyPlateEditor as unknown as (
    editor: PliteEditor,
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
 *   plugins: [ParagraphPlugin.configure({ component: ParagraphElement })],
 *   components: { [CodePlugin.name]: CodeLeaf },
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

export function createEditor<
  const TOptions extends CreateEditorOptionsForValue<
    any,
    readonly EditorExtensionReference[],
    readonly BasePluginInput[],
    EditorApplicationSchema | undefined
  > & {
    extensions: readonly EditorExtensionReference[];
  },
>(
  options: TOptions
): Editor<
  EditorValueFromOptions<TOptions>,
  EditorExtensionsFromOptions<TOptions>,
  EditorPluginsFromOptions<TOptions>,
  EditorSchemaFromOptions<TOptions>
>;
export function createEditor<
  V extends Value,
  const TExtensions extends readonly EditorExtensionReference[],
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateEditorOptions<V, TExtensions, TPlugins, TSchema> & {
    extensions: TExtensions;
  }
): Editor<V, TExtensions, TPlugins, TSchema>;
export function createEditor<
  V extends Value = Value,
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options?: CreateEditorOptions<V, readonly [], TPlugins, TSchema> & {
    extensions?: readonly [];
  }
): Editor<V, readonly [], TPlugins, TSchema>;

export function createEditor(options: unknown = {}): unknown {
  const resolvedOptions = options as CreateEditorOptionsForValue<
    Value,
    readonly EditorExtensionReference[],
    readonly BasePluginInput[],
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
    readonly EditorExtensionReference[],
    readonly BasePluginInput[],
    EditorApplicationSchema | undefined,
    PliteEditor<Value, any>
  >(editor as PliteEditor<Value, any>, editorOptions);
}
