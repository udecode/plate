import type { RuntimePluginReference, Value } from '../../facade';
import type { EditorApplicationSchema, EditorValueInput } from '../../lib';
import {
  buildEditor,
  EDITOR_OPTION_KEYS,
  type EditorOptions as HeadlessEditorOptions,
  type PlatePluginsFromTuple,
  readConstructorOptions,
  type RuntimePluginsFromTuple,
} from '../../lib/editor/withPlite';
import type { Shortcuts, PluginDefinitionInput } from '../plugin';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';
import type { Editor } from './Editor';
import { getPlateCorePlugins } from './getPlateCorePlugins.internal';

type PluginInput = RuntimePluginReference;

export type { InferEditorPlugins } from './Editor';

type ReactEditorOptions<
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
          editor: Editor<
            Value,
            TPlugins,
            PlatePluginsFromTuple<TPlugins>,
            TSchema
          >;
        }) => EditorValueInput<Value>)
      | EditorValueInput<Value>;
    plugins?: TPlugins;
    schema?: TSchema;
  };

export type CreateEditorOptions<
  TPlugins extends readonly RuntimePluginReference[] = readonly PluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = Partial<Omit<ReactEditorOptions<TPlugins, TSchema>, 'plugins'>> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  plugins?: TPlugins;
};

/** @internal */
export const REACT_EDITOR_OPTION_KEYS = {
  ...EDITOR_OPTION_KEYS,
  navigationFeedback: true,
  on: true,
  render: true,
  shortcuts: true,
} satisfies Record<keyof CreateEditorOptions, true>;

/** @internal */
export const USE_CREATE_EDITOR_OPTION_KEYS = {
  ...REACT_EDITOR_OPTION_KEYS,
  enabled: true,
} satisfies Record<keyof CreateEditorOptions | 'enabled', true>;

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
 * @see {@link useCreateEditor} for a memoized version in React components.
 * @see `createEditor` from `platejs` for an editor without React.
 */
export function createEditor<
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options?: CreateEditorOptions<readonly [], TSchema>
): Editor<Value, readonly [], readonly [], TSchema>;
export function createEditor<
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateEditorOptions<TPlugins, TSchema> & { plugins: TPlugins }
): Editor<
  Value,
  RuntimePluginsFromTuple<TPlugins>,
  PlatePluginsFromTuple<TPlugins>,
  TSchema
>;

export function createEditor(options: unknown = {}): unknown {
  return createPlateEditor(options, false);
}

/** @internal */
export const createDormantPlateEditor = (options: unknown) =>
  createPlateEditor(options, true);

const createPlateEditor = (options: unknown, dormant: boolean) => {
  const resolvedOptions = options as CreateEditorOptions;

  const {
    navigationFeedback,
    plugins = [],
    ...rest
  } = readConstructorOptions(resolvedOptions, REACT_EDITOR_OPTION_KEYS);

  return buildEditor(
    {
      ...rest,
      plugins: [...getPlateCorePlugins({ navigationFeedback }), ...plugins],
    },
    dormant
  );
};
