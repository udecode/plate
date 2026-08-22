import { createEditor, type Editor, type Value } from '@platejs/plite';

import type { GeneratedEditorValue } from '../../internal/editor/generatedEditorTypes';
import {
  type BaseEditorOptions,
  type BasePluginInput,
  type CreateBaseEditorOptions,
  type EditorApplicationSchema,
  type EditorValueInput,
  createBaseEditor,
} from '../../lib';
import type { Shortcuts, PlatePluginDefinitionInput } from '../plugin';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';
import {
  getPlateCorePlugins,
  type PlateCorePlugin,
} from './getPlateCorePlugins';
import type {
  InferPlateEditorPlugins,
  InferPlateEditorSchemaPlugins,
  InternalPlateEditorMutationProvider,
  InternalPlateEditorWithInstalledPlugins,
  PlateEditor,
} from './PlateEditor';

export type { PlateCorePlugin } from './getPlateCorePlugins';

type PlatePluginInput = BasePluginInput;

type ProjectInjectedEditor<TEditor, TProjection> = Omit<
  TEditor,
  keyof TProjection
> &
  TProjection;

export type InferPlateEditorValue<TPlugins> = GeneratedEditorValue<TPlugins>;

export type { InferPlateEditorPlugins } from './PlateEditor';

type PlateEditorOptions<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly PlatePluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = Omit<BaseEditorOptions, 'id' | 'plugins' | 'schema'> &
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
          editor: PlateEditor<TPlugins, TSchema>;
        }) => EditorValueInput<V>)
      | EditorValueInput<V>;
    plugins?: TPlugins;
    schema?: TSchema;
  };

const applyPlateEditor = <
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
  E extends Editor = Editor,
  V extends Value = E extends Editor<infer T, infer _TExtensions> ? T : Value,
>(
  e: E,
  options: PlateEditorOptions<V, TPlugins, TSchema>
): InternalPlateEditorWithInstalledPlugins<
  V,
  InferPlateEditorPlugins<TPlugins>,
  InternalPlateEditorMutationProvider<
    TPlugins,
    InferPlateEditorSchemaPlugins<TPlugins>,
    TSchema
  >
> => {
  const { navigationFeedback, plugins = [], readOnly, ...rest } = options;
  const combinedPlugins = [
    ...getPlateCorePlugins({ navigationFeedback }),
    ...plugins,
  ];

  const editor = createBaseEditor({
    editor: e,
    readOnly,
    ...rest,
    plugins: combinedPlugins,
  } as unknown as CreateBaseEditorOptions<
    readonly BasePluginInput[],
    TSchema
  > & {
    plugins: readonly BasePluginInput[];
  });

  return editor as unknown as InternalPlateEditorWithInstalledPlugins<
    V,
    InferPlateEditorPlugins<TPlugins>,
    InternalPlateEditorMutationProvider<
      TPlugins,
      InferPlateEditorSchemaPlugins<TPlugins>,
      TSchema
    >
  >;
};

type CreatePlateEditorOptionsForValue<
  V extends Value,
  TPlugins extends readonly unknown[],
  TSchema extends EditorApplicationSchema | undefined,
> = Partial<
  Omit<PlateEditorOptions<V, NoInfer<TPlugins>, TSchema>, 'plugins'>
> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /**
   * Existing Plite editor to configure as a Plate editor.
   *
   * @default createEditor()
   */
  editor?: Editor;
  plugins?: TPlugins;
};

export type CreatePlateEditorOptions<
  TPlugins extends readonly unknown[] = readonly PlatePluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = CreatePlateEditorOptionsForValue<Value, TPlugins, TSchema>;

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
 * const editor = createPlateEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   initialValue: [{ type: 'paragraph', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom components
 * const editor = createPlateEditor({
 *   plugins: [ParagraphPlugin.configure({ component: ParagraphElement })],
 *   components: { [CodePlugin.name]: CodeLeaf },
 * });
 *
 * // Editor with React-specific options
 * const editor = createPlateEditor({
 *   plugins: [ParagraphPlugin],
 *   on: { keyDown: customKeyHandler },
 * });
 *
 * // Name the schema only when persisted or collaborative state needs lineage.
 * const persistedEditor = createPlateEditor({
 *   schema: { id: 'acme-document', version: 1 },
 * });
 * ```
 *
 * @see {@link createBaseEditor} for a non-React version of editor creation.
 * @see {@link usePlateEditor} for a memoized version in React components.
 */
export function createPlateEditor<
  const TPlugins extends readonly BasePluginInput[] =
    readonly PlateCorePlugin[],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreatePlateEditorOptions<TPlugins, TSchema>
): PlateEditor<TPlugins, TSchema>;
export function createPlateEditor<
  const TEditor,
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: Omit<
    CreatePlateEditorOptions<TPlugins, TSchema>,
    'editor' | 'initialValue'
  > & {
    editor: TEditor extends Editor<infer _V, infer _TExtensions>
      ? TEditor
      : never;
    initialValue?: CreatePlateEditorOptionsForValue<
      TEditor extends Editor<infer V, infer _TExtensions> ? V : never,
      TPlugins,
      TSchema
    >['initialValue'];
  }
): ProjectInjectedEditor<
  TEditor,
  InternalPlateEditorWithInstalledPlugins<
    TEditor extends Editor<infer V, infer _TExtensions> ? V : never,
    InferPlateEditorPlugins<TPlugins>,
    InternalPlateEditorMutationProvider<
      TPlugins,
      InferPlateEditorPlugins<TPlugins>,
      TSchema
    >
  >
>;

export function createPlateEditor<
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options?: CreatePlateEditorOptions<readonly [], TSchema>
): PlateEditor<readonly [], TSchema>;

export function createPlateEditor(options: unknown = {}): unknown {
  const resolvedOptions = options as CreatePlateEditorOptionsForValue<
    Value,
    readonly BasePluginInput[],
    EditorApplicationSchema | undefined
  >;
  const { editor, id, ...plateEditorOptions } = resolvedOptions;
  const baseEditor =
    editor ??
    createEditor({
      id,
      maxLength: resolvedOptions.maxLength,
      readOnly: resolvedOptions.readOnly,
    });

  return applyPlateEditor<
    readonly BasePluginInput[],
    EditorApplicationSchema | undefined,
    Editor<Value, any>,
    Value
  >(baseEditor as Editor<Value, any>, plateEditorOptions);
}
