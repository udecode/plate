import { type Editor, type Value, createEditor } from '@platejs/slate';

import type { AnyPlatePlugin } from '../plugin';
import type { EventEditorPlugin, SlateReactExtensionPlugin } from '../plugins';
import type { PlateEditor, TPlateEditor } from './PlateEditor';

import {
  type AnyPluginConfig,
  type BaseWithSlateOptions,
  type CorePlugin,
  type InferPlugins,
  withSlate,
} from '../../lib';
import { createZustandStore } from '../libs/zustand';
import { getPlateCorePlugins } from './getPlateCorePlugins';

export type PlateCorePlugin =
  | CorePlugin
  | typeof EventEditorPlugin
  | typeof SlateReactExtensionPlugin;

export type WithPlateOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = BaseWithSlateOptions<P> &
  Pick<
    Partial<AnyPlatePlugin>,
    | 'api'
    | 'decorate'
    | 'extendEditor'
    | 'handlers'
    | 'inject'
    | 'normalizeInitialValue'
    | 'options'
    | 'override'
    | 'priority'
    | 'render'
    | 'shortcuts'
    | 'transforms'
    | 'useHooks'
  > & {
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
    value?: ((editor: PlateEditor) => Promise<V> | V) | V | string;
    rootPlugin?: (plugin: AnyPlatePlugin) => AnyPlatePlugin;
    onReady?: (ctx: {
      editor: PlateEditor;
      isAsync: boolean;
      value: V;
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
 * @see {@link withSlate} for the non-React version of editor enhancement.
 */
export const withPlate = <
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>(
  e: Editor,
  options: WithPlateOptions<V, P> = {}
): TPlateEditor<V, InferPlugins<P[]>> => {
  const { optionsStoreFactory, plugins = [], ...rest } = options;

  const editor = withSlate<V, P>(e, {
    ...rest,
    optionsStoreFactory: optionsStoreFactory ?? createZustandStore,
    plugins: [...getPlateCorePlugins(), ...plugins],
  } as any) as unknown as TPlateEditor<V, InferPlugins<P[]>>;

  return editor;
};

export type CreatePlateEditorOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = WithPlateOptions<V, P> & {
  /**
   * Initial editor to be extended with `withPlate`.
   *
   * @default createEditor()
   */
  editor?: Editor;
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
 * @see {@link createSlateEditor} for a non-React version of editor creation.
 * @see {@link usePlateEditor} for a memoized version in React components.
 * @see {@link withPlate} for the underlying function that applies Plate enhancements to an editor.
 */
export const createPlateEditor = <
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
>({
  editor = createEditor(),
  ...options
}: CreatePlateEditorOptions<V, P> = {}): TPlateEditor<V, InferPlugins<P[]>> =>
  withPlate<V, P>(editor, options);
