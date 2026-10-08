import type { RuntimePluginReference, Value } from '../../facade';
import type { GeneratedEditorValue } from '../../internal/editor/generatedEditorTypes';
import type { EditorApplicationSchema, EditorValueInput } from '../../lib';
import {
  assertConstructorOptions,
  buildEditor,
  type EditorOptions as HeadlessEditorOptions,
  type PlatePluginsFromTuple,
  type RuntimePluginsFromTuple,
} from '../../lib/editor/withPlite';
import type { Shortcuts, PluginDefinitionInput } from '../plugin';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';
import type { Editor } from './Editor';
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

type CreateEditorOptionsForValue<
  V extends Value,
  TPlugins extends readonly RuntimePluginReference[],
  TSchema extends EditorApplicationSchema | undefined,
> = Partial<Omit<ReactEditorOptions<V, TPlugins, TSchema>, 'plugins'>> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  plugins?: TPlugins;
};

export type CreateEditorOptions<
  V extends Value = Value,
  TPlugins extends readonly RuntimePluginReference[] = readonly PluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = CreateEditorOptionsForValue<V, TPlugins, TSchema>;

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

  assertConstructorOptions(resolvedOptions);
  // Named reads keep allocation options that the options object inherits.
  const {
    id,
    lifecycleErrorSink,
    maxLength,
    navigationFeedback,
    plugins = [],
    readOnly,
    ...rest
  } = resolvedOptions;

  return buildEditor({
    ...rest,
    id,
    lifecycleErrorSink,
    maxLength,
    plugins: [...getPlateCorePlugins({ navigationFeedback }), ...plugins],
    readOnly,
  });
}
