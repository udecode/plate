import { createEditor, type Editor, type Value } from '@platejs/plite';

import type { PlatePluginDefinitionInput, Shortcuts } from '../plugin';
import type {
  InternalPlateEditorWithInstalledPlugins,
  PlateEditor,
} from './PlateEditor';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';
import { plateReactCorePlugins } from '../../internal/plugin/resolvePlugins';

import {
  type AnyBasePluginDefinition,
  type BasePluginDefinitionInput,
  type BasePluginInput,
  type BaseExtendBaseEditorOptions,
  type ExtendBaseEditorOptions,
  type EditorValueInput,
  type InferPlugins,
  type MergeInstalledPluginDefinitions,
  extendBaseEditor,
} from '../../lib';
import {
  getPlateCorePlugins,
  type PlateCorePlugin,
  type PlateCorePlugins,
} from './getPlateCorePlugins';

export type { PlateCorePlugin } from './getPlateCorePlugins';

type PlatePluginInput = BasePluginInput;

type PlateInstalledCorePlugin = InferPlugins<PlateCorePlugins>;

type MergePlateEditorPlugins<D> = MergeInstalledPluginDefinitions<
  PlateInstalledCorePlugin,
  D
>;

type InferPlateEditorPlugins<TPlugins extends readonly unknown[]> = [
  TPlugins[number],
] extends [never]
  ? PlateInstalledCorePlugin
  : MergePlateEditorPlugins<InferPlugins<TPlugins>>;

type InferExistingPlateEditorPlugins<E> =
  E extends InternalPlateEditorWithInstalledPlugins<infer _V, infer P>
    ? P
    : E extends PlateEditor<infer _V, infer P extends AnyBasePluginDefinition>
      ? P
      : never;

type InferPlateEditorValue<E> =
  E extends InternalPlateEditorWithInstalledPlugins<infer V, infer _P>
    ? V
    : E extends PlateEditor<infer V, infer _P extends AnyBasePluginDefinition>
      ? V
      : E extends Editor<infer V, infer _TExtensions>
        ? V
        : Value;

type InferExtendedPlateEditorPlugins<E, TPlugins extends readonly unknown[]> = [
  TPlugins[number],
] extends [never]
  ? InferExistingPlateEditorPlugins<E>
  : MergeInstalledPluginDefinitions<
      InferExistingPlateEditorPlugins<E>,
      InferPlugins<TPlugins>
    >;

export type ExtendPlateEditorOptions<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly PlatePluginInput[],
> = Omit<BaseExtendBaseEditorOptions, 'id' | 'plugins'> &
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
    api?: BasePluginDefinitionInput['api'];
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
    //   enabled?: Partial<Record<NameofPlugins<InferPlugins<P[]>>, boolean>>;
    //   plugins?: Partial<
    //     Record<
    //       NameofPlugins<InferPlugins<P[]>>,
    //       Partial<EditorPlatePlugin<AnyBasePluginDefinition>>
    //     >
    //   >;
    // };
    initialValue?:
      | ((context: {
          editor: InternalPlateEditorWithInstalledPlugins<
            V,
            InferPlateEditorPlugins<TPlugins>
          >;
        }) => EditorValueInput<V>)
      | EditorValueInput<V>;
    plugins?: TPlugins;
  };

/**
 * Applies Plate enhancements to an editor instance (React version).
 *
 * @remarks
 *   This function supports React-specific features including component rendering,
 *   event handlers, and React hooks integration.
 * @see {@link createPlateEditor} for a higher-level React editor creation function.
 * @see {@link usePlateEditor} for a memoized version in React components.
 * @see {@link extendBaseEditor} for the non-React version of editor enhancement.
 */
export const extendPlateEditor = <
  const TPlugins extends readonly unknown[] = readonly [],
  E extends Editor = Editor,
  V extends Value = InferPlateEditorValue<E>,
>(
  e: E,
  options: ExtendPlateEditorOptions<V, TPlugins>
): InternalPlateEditorWithInstalledPlugins<
  V,
  InferExtendedPlateEditorPlugins<E, TPlugins>
> => {
  const { navigationFeedback, plugins = [], readOnly, ...rest } = options;

  const editor = (extendBaseEditor as any)(e, {
    readOnly,
    ...rest,
    [plateReactCorePlugins]: getPlateCorePlugins({ navigationFeedback }),
    plugins,
  } as unknown as ExtendBaseEditorOptions<
    V,
    BasePluginInput
  >) as InternalPlateEditorWithInstalledPlugins<
    V,
    InferExtendedPlateEditorPlugins<E, TPlugins>
  >;

  return editor;
};

export type CreatePlateEditorOptions<
  V extends Value,
  TPlugins extends readonly unknown[],
> = Partial<Omit<ExtendPlateEditorOptions<V, NoInfer<TPlugins>>, 'plugins'>> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /**
   * Initial editor to be extended with `extendPlateEditor`.
   *
   * @default createEditor()
   */
  editor?: Editor;
  plugins?: TPlugins;
};

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
 *   initialValue: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
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
 * @see {@link extendPlateEditor} for the underlying function that applies Plate enhancements to an editor.
 */
export function createPlateEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly PlateCorePlugin[],
>(
  options: CreatePlateEditorOptions<V, TPlugins>
): InternalPlateEditorWithInstalledPlugins<
  V,
  InferPlateEditorPlugins<TPlugins>
>;

export function createPlateEditor<V extends Value = Value>(
  options?: CreatePlateEditorOptions<V, readonly PlatePluginInput[]>
): InternalPlateEditorWithInstalledPlugins<V, PlateCorePlugin>;

export function createPlateEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly PlateCorePlugin[],
>(
  options: CreatePlateEditorOptions<V, TPlugins> = {}
): InternalPlateEditorWithInstalledPlugins<
  V,
  InferPlateEditorPlugins<TPlugins>
> {
  const { editor, id, ...extendPlateEditorOptions } = options;
  const baseEditor =
    editor ??
    createEditor({
      id,
      maxLength: options.maxLength,
      readOnly: options.readOnly,
    });

  return extendPlateEditor(
    baseEditor,
    extendPlateEditorOptions as unknown as ExtendPlateEditorOptions<V, TPlugins>
  ) as unknown as InternalPlateEditorWithInstalledPlugins<
    V,
    InferPlateEditorPlugins<TPlugins>
  >;
}
