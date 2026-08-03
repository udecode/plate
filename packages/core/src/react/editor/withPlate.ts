import { createEditor, type Editor, type Value } from '@platejs/plite';

import type { Shortcuts } from '../plugin';
import type {
  InferPlateEditorPlugins,
  InferPlateEditorSchemaPlugins,
  InternalPlateEditorMutationProvider,
  InternalPlateEditorWithInstalledPlugins,
  PlateEditor,
} from './PlateEditor';
import {
  type GeneratedEditorValue,
  inheritGeneratedEditorContract,
} from '../../lib/editor/defineEditor';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';

import {
  type BaseEditorOptions,
  type BasePluginInput,
  type CreateBaseEditorOptions,
  type EditorValueInput,
  createBaseEditor,
} from '../../lib';
import type { PlatePluginDefinitionInput } from '../plugin';
import {
  getPlateCorePlugins,
  type PlateCorePlugin,
} from './getPlateCorePlugins';

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
> = Omit<BaseEditorOptions, 'id' | 'plugins'> &
  Omit<
    Partial<
      Pick<
        PlatePluginDefinitionInput,
        | 'decorate'
        | 'inject'
        | 'on'
        | 'transformInitialValue'
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
      | ((context: { editor: PlateEditor<TPlugins> }) => EditorValueInput<V>)
      | EditorValueInput<V>;
    plugins?: TPlugins;
  };

const applyPlateEditor = <
  const TPlugins extends readonly BasePluginInput[] = readonly [],
  E extends Editor = Editor,
  V extends Value = E extends Editor<infer T, infer _TExtensions> ? T : Value,
>(
  e: E,
  options: PlateEditorOptions<V, TPlugins>
): InternalPlateEditorWithInstalledPlugins<
  V,
  InferPlateEditorPlugins<TPlugins>,
  InferPlateEditorSchemaPlugins<TPlugins>
> => {
  const { navigationFeedback, plugins = [], readOnly, ...rest } = options;
  const combinedPlugins = [
    ...getPlateCorePlugins({ navigationFeedback }),
    ...plugins,
  ];

  inheritGeneratedEditorContract(plugins, combinedPlugins);

  const editor = createBaseEditor({
    editor: e,
    readOnly,
    ...rest,
    plugins: combinedPlugins,
  } as unknown as CreateBaseEditorOptions<readonly BasePluginInput[]> & {
    plugins: readonly BasePluginInput[];
  });

  return editor as unknown as InternalPlateEditorWithInstalledPlugins<
    V,
    InferPlateEditorPlugins<TPlugins>,
    InferPlateEditorSchemaPlugins<TPlugins>
  >;
};

type CreatePlateEditorOptionsForValue<
  V extends Value,
  TPlugins extends readonly unknown[],
> = Partial<Omit<PlateEditorOptions<V, NoInfer<TPlugins>>, 'plugins'>> & {
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
> = CreatePlateEditorOptionsForValue<Value, TPlugins>;

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
 *   plugins: [ParagraphPlugin, H1Plugin],
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
 *   schemaIdentity: { id: 'acme-document', version: 1 },
 * });
 * ```
 *
 * @see {@link createBaseEditor} for a non-React version of editor creation.
 * @see {@link usePlateEditor} for a memoized version in React components.
 */
export function createPlateEditor<
  const TPlugins extends
    readonly BasePluginInput[] = readonly PlateCorePlugin[],
>(options: CreatePlateEditorOptions<TPlugins>): PlateEditor<TPlugins>;
export function createPlateEditor<
  const TEditor,
  const TPlugins extends readonly BasePluginInput[] = readonly [],
>(
  options: Omit<
    CreatePlateEditorOptions<TPlugins>,
    'editor' | 'initialValue'
  > & {
    editor: TEditor extends Editor<infer _V, infer _TExtensions>
      ? TEditor
      : never;
    initialValue?: CreatePlateEditorOptionsForValue<
      TEditor extends Editor<infer V, infer _TExtensions> ? V : never,
      TPlugins
    >['initialValue'];
  }
): ProjectInjectedEditor<
  TEditor,
  InternalPlateEditorWithInstalledPlugins<
    TEditor extends Editor<infer V, infer _TExtensions> ? V : never,
    InferPlateEditorPlugins<TPlugins>,
    InternalPlateEditorMutationProvider<
      TPlugins,
      InferPlateEditorPlugins<TPlugins>
    >
  >
>;

export function createPlateEditor(
  options?: CreatePlateEditorOptions<readonly []>
): PlateEditor<readonly []>;

export function createPlateEditor(options: unknown = {}): unknown {
  const resolvedOptions = options as CreatePlateEditorOptionsForValue<
    Value,
    readonly BasePluginInput[]
  >;
  const { editor, id, ...plateEditorOptions } = resolvedOptions;
  const baseEditor =
    editor ??
    createEditor({
      id,
      maxLength: resolvedOptions.maxLength,
      readOnly: resolvedOptions.readOnly,
    });

  return applyPlateEditor(
    baseEditor,
    plateEditorOptions as PlateEditorOptions<Value, readonly BasePluginInput[]>
  ) as unknown as PlateEditor;
}
