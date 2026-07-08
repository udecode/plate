import type { Editor, Value } from '@platejs/plite';
import { createReactEditor } from '@platejs/plite-react';

import type { AnyPlatePlugin, PlatePlugin } from '../plugin';
import type { PlateEditor } from './PlateEditor';
import type { NavigationFeedbackConfig } from '../plugins/navigation-feedback/types';

import {
  type AnyPluginConfig,
  type BasePlugin,
  type BasePluginInput,
  type BaseExtendBaseEditorOptions,
  type CorePlugin,
  type ExtendBaseEditorOptions,
  type PluginConfig,
  extendBaseEditor,
} from '../../lib';
import { createZustandStore } from '../libs/zustand';
import { getPlateCorePlugins } from './getPlateCorePlugins';

export type PlateCorePlugin =
  | CorePlugin
  | ReturnType<typeof getPlateCorePlugins>[number];

type PlatePluginInput<C extends AnyPluginConfig = AnyPluginConfig> =
  | AnyPluginConfig
  | BasePlugin<C>
  | PlatePlugin<C>;

type InferPlateEditorPluginConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends PlatePlugin<infer C>
    ? C
    : P extends BasePlugin<infer C>
      ? C
      : P extends AnyPluginConfig
        ? P
        : PluginConfig;

type InferPlateEditorPlugins<TPlugins extends readonly unknown[]> = [
  TPlugins[number],
] extends [never]
  ? PlateCorePlugin
  : PlateCorePlugin | InferPlateEditorPluginConfig<TPlugins[number]>;

type InferExistingPlateEditorPlugins<E> =
  E extends PlateEditor<infer _V, infer P> ? P : never;

type InferPlateEditorValue<E> =
  E extends PlateEditor<infer V, infer _P>
    ? V
    : E extends Editor<infer V, infer _TExtensions>
      ? V
      : Value;

type InferExtendedPlateEditorPlugins<E, TPlugins extends readonly unknown[]> =
  | InferExistingPlateEditorPlugins<E>
  | InferPlateEditorPlugins<TPlugins>;

export type ExtendPlateEditorOptions<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly PlatePluginInput[],
> = Omit<BaseExtendBaseEditorOptions, 'id' | 'plugins'> &
  Pick<
    Partial<AnyPlatePlugin>,
    | 'api'
    | 'decorate'
    | 'handlers'
    | 'inject'
    | 'transformInitialValue'
    | 'options'
    | 'override'
    | 'priority'
    | 'render'
    | 'shortcuts'
    | 'useHooks'
  > & {
    /**
     * Configuration for the built-in navigation feedback plugin.
     *
     * This React plugin flashes the landed target after navigation jumps such as
     * TOC, footnote, search, or custom outline movement.
     *
     * @default { duration: 1600 }
     */
    navigationFeedback?: Partial<NavigationFeedbackConfig['options']> | boolean;
    // override?: {
    //   /** Enable or disable plugins */
    //   enabled?: Partial<Record<KeyofPlugins<InferPlugins<P[]>>, boolean>>;
    //   plugins?: Partial<
    //     Record<
    //       KeyofPlugins<InferPlugins<P[]>>,
    //       Partial<EditorPlatePlugin<AnyPluginConfig>>
    //     >
    //   >;
    // };
    value?:
      | ((editor: PlateEditor) => Promise<NoInfer<V>> | NoInfer<V>)
      | V
      | string;
    plugins?: TPlugins;
    rootPlugin?: (plugin: AnyPlatePlugin) => AnyPlatePlugin;
    onReady?: (ctx: {
      editor: PlateEditor;
      isAsync: boolean;
      value: NoInfer<V>;
    }) => void;
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
  options: ExtendPlateEditorOptions<V, TPlugins> = {}
): PlateEditor<V, InferExtendedPlateEditorPlugins<E, TPlugins>> => {
  const {
    navigationFeedback,
    optionsStoreFactory,
    plugins = [],
    readOnly,
    ...rest
  } = options;

  const editor = (extendBaseEditor as any)(e, {
    navigationFeedback,
    readOnly,
    ...rest,
    optionsStoreFactory: optionsStoreFactory ?? createZustandStore,
    plugins: [...getPlateCorePlugins({ navigationFeedback }), ...plugins],
  } as unknown as ExtendBaseEditorOptions<V, BasePluginInput>) as PlateEditor<
    V,
    InferExtendedPlateEditorPlugins<E, TPlugins>
  >;

  return editor;
};

export type CreatePlateEditorOptions<
  V extends Value,
  TPlugins extends readonly unknown[],
> = Omit<ExtendPlateEditorOptions<V, TPlugins>, 'plugins'> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /**
   * Initial editor to be extended with `extendPlateEditor`.
   *
   * @default createReactEditor()
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
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   value: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom components
 * const editor = createPlateEditor({
 *   plugins: [ParagraphPlugin.withComponent(ParagraphElement)],
 *   components: { [CodePlugin.key]: CodeLeaf },
 * });
 *
 * // Editor with React-specific options
 * const editor = createPlateEditor({
 *   plugins: [ParagraphPlugin],
 *   handlers: { onKeyDown: customKeyHandler },
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
  options?: CreatePlateEditorOptions<V, TPlugins>
): PlateEditor<V, InferPlateEditorPlugins<TPlugins>>;

export function createPlateEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly PlateCorePlugin[],
>(
  options: CreatePlateEditorOptions<V, TPlugins> = {}
): PlateEditor<V, InferPlateEditorPlugins<TPlugins>> {
  const { editor, id, ...extendPlateEditorOptions } = options;
  const baseEditor =
    editor ??
    createReactEditor({
      id,
      maxLength: options.maxLength,
      readOnly: options.readOnly,
    });

  return extendPlateEditor(
    baseEditor,
    extendPlateEditorOptions as unknown as ExtendPlateEditorOptions<V, TPlugins>
  ) as unknown as PlateEditor<V, InferPlateEditorPlugins<TPlugins>>;
}
