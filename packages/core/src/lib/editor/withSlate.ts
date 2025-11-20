import {
  type Editor,
  type TSelection,
  type Value,
  createEditor,
} from '@platejs/slate';
import { nanoid } from 'nanoid';

import type { PluginStoreFactory } from '../../internal/plugin/resolvePlugins';
import type { AnyPluginConfig, NodeComponents } from '../plugin/BasePlugin';
import type { AnySlatePlugin } from '../plugin/SlatePlugin';
import type { ChunkingConfig } from '../plugins/chunking';
import type { NodeIdConfig } from '../plugins/node-id/NodeIdPlugin';
import type { InferPlugins, SlateEditor, TSlateEditor } from './SlateEditor';

import { resolvePlugins } from '../../internal/plugin/resolvePlugins';
import { createSlatePlugin } from '../plugin/createSlatePlugin';
import { getPluginType, getSlatePlugin } from '../plugin/getSlatePlugin';
import { type CorePlugin, getCorePlugins } from '../plugins/getCorePlugins';

export type BaseWithSlateOptions<P extends AnyPluginConfig = CorePlugin> = {
  /**
   * Unique identifier for the editor instance.
   *
   * @default nanoid()
   */
  id?: string;
  /**
   * Determines which mark/element to apply at boundaries between different
   * marks, based on cursor movement using the left/right arrow keys.
   *
   * Example: <text bold>Bold</text><cursor><text italic>Italic</text>
   *
   * If the cursor moved here from the left (via → key), typing applies
   * **bold**.
   *
   * If the cursor moved here from the right (via ← key), typing applies
   * _italic_.
   *
   * Without mark affinity, the preceding mark (**bold**) is always applied
   * regardless of direction.
   *
   * @default true
   */
  affinity?: boolean;
  /**
   * Select the editor after initialization.
   *
   * @default false
   *
   * - `true` | 'end': Select the end of the editor
   * - `false`: Do not select anything
   * - `'start'`: Select the start of the editor
   */
  autoSelect?: boolean | 'end' | 'start';
  /**
   * Configure Slate's chunking optimization, which reduces latency while
   * typing. Set to `false` to disable.
   *
   * @default true
   * @see https://docs.slatejs.org/walkthroughs/09-performance
   */
  chunking?: ChunkingConfig['options'] | boolean;
  /** Specifies the component for each plugin key. */
  components?: NodeComponents;
  /** Specifies the component for each plugin key. */
  // components?: Partial<
  //   Record<KeyofNodePlugins<InferPlugins<P[]>>, NodeComponent | null>
  // >;
  /**
   * Specifies the maximum number of characters allowed in the editor. When the
   * limit is reached, further input will be prevented.
   */
  maxLength?: number;
  /**
   * Configuration for automatic node ID generation and management.
   *
   * Unless set to `false`, the editor automatically adds unique IDs to nodes
   * through the core NodeIdPlugin:
   *
   * - Normalizes the initial value for missing IDs
   * - Adds IDs to new nodes during insertion
   * - Preserves or reuses IDs on undo/redo and copy/paste operations
   * - Handles ID conflicts and duplicates
   *
   * @default { idKey: 'id', filterInline: true, filterText: true, idCreator: () => nanoid(10) }
   */
  nodeId?: NodeIdConfig['options'] | boolean;
  /**
   * Factory used to create the per-plugin options store
   *
   * @default createVanillaStore from zustand-x/vanilla
   */
  optionsStoreFactory?: PluginStoreFactory;
  // override?: {
  //   components?: Partial<
  //     Record<KeyofNodePlugins<InferPlugins<P[]>>, NodeComponent | null>
  //   >;
  // };
  /**
   * Array of plugins to be loaded into the editor. Plugins extend the editor's
   * functionality and define custom behavior.
   */
  plugins?: P[];
  /**
   * Editor read-only initial state. For dynamic read-only control, use the
   * `Plate.readOnly` prop instead.
   *
   * @default false
   */
  readOnly?: boolean;
  /**
   * Initial selection state for the editor. Defines where the cursor should be
   * positioned when the editor loads.
   */
  selection?: TSelection;
  /**
   * When `true`, normalizes the initial `value` passed to the editor. This is
   * useful when adding normalization rules to already existing content or when
   * the initial value might not conform to the current schema.
   *
   * Note: Normalization may take time for large documents.
   *
   * @default false
   */
  shouldNormalizeEditor?: boolean;
  /**
   * When `true`, skips the initial value, selection, and normalization logic.
   * Useful when the editor state is managed externally (e.g., with Yjs
   * collaboration) or when you want to manually control the initialization
   * process.
   *
   * @default false
   */
  skipInitialization?: boolean;
};

export type WithSlateOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = BaseWithSlateOptions<P> &
  Pick<
    Partial<AnySlatePlugin>,
    | 'api'
    | 'decorate'
    | 'extendEditor'
    | 'inject'
    | 'normalizeInitialValue'
    | 'options'
    | 'override'
    | 'transforms'
  > & {
    // override?: {
    //   /** Enable or disable plugins */
    //   enabled?: Partial<Record<KeyofPlugins<InferPlugins<P[]>>, boolean>>;
    //   plugins?: Partial<
    //     Record<
    //       KeyofPlugins<InferPlugins<P[]>>,
    //       PartialEditorPlugin<AnyPluginConfig>
    //     >
    //   >;
    // };
    /**
     * Initial content for the editor.
     *
     * Can be:
     *
     * - A static value (array of nodes)
     * - An HTML string that will be deserialized
     * - A function that returns a value or Promise<value>
     * - `null` for an empty editor
     *
     * @default [{ type: 'p'; children: [{ text: '' }] }]
     */
    value?: ((editor: SlateEditor) => Promise<V> | V) | V | string | null;
    /** Function to configure the root plugin */
    rootPlugin?: (plugin: AnySlatePlugin) => AnySlatePlugin;
    /**
     * Callback called when the editor is ready (after initialization
     * completes).
     */
    onReady?: (ctx: {
      editor: SlateEditor;
      isAsync: boolean;
      value: V;
    }) => void;
  };

/**
 * Applies Plate enhancements to an editor instance (non-React version).
 *
 * @remarks
 *   This function supports server-side usage as it doesn't include React-specific
 *   features like component rendering or hooks integration.
 * @see {@link createSlateEditor} for a higher-level non-React editor creation function.
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 * @see {@link withPlate} for the React-specific enhancement function.
 */
export const withSlate = <
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
>(
  e: Editor,
  {
    id,
    affinity = true,
    autoSelect,
    chunking = true,
    maxLength,
    nodeId,
    optionsStoreFactory,
    plugins = [],
    readOnly = false,
    rootPlugin,
    selection,
    shouldNormalizeEditor,
    skipInitialization,
    value,
    onReady,
    ...pluginConfig
  }: WithSlateOptions<V, P> = {}
): TSlateEditor<V, InferPlugins<P[]>> => {
  const editor = e as SlateEditor;

  editor.id = id ?? editor.id ?? nanoid();
  editor.meta.key = editor.meta.key ?? nanoid();
  editor.meta.isFallback = false;
  editor.dom = {
    composing: false,
    currentKeyboardEvent: null,
    focused: false,
    prevSelection: null,
    readOnly,
  };

  editor.getApi = () => editor.api as any;
  editor.getTransforms = () => editor.transforms as any;
  editor.getPlugin = (plugin) => getSlatePlugin(editor, plugin) as any;
  editor.getType = (pluginKey) => getPluginType(editor, pluginKey);
  editor.getInjectProps = (plugin) => {
    const nodeProps =
      editor.getPlugin<AnySlatePlugin>(plugin).inject?.nodeProps ?? ({} as any);

    nodeProps.nodeKey = nodeProps.nodeKey ?? editor.getType(plugin.key);
    nodeProps.styleKey = nodeProps.styleKey ?? nodeProps.nodeKey;

    return nodeProps;
  };
  editor.getOptionsStore = (plugin) => editor.getPlugin(plugin).optionsStore;
  editor.getOptions = (plugin) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) return editor.getPlugin(plugin).options;

    return editor.getOptionsStore(plugin).get('state');
  };
  editor.getOption = (plugin, key, ...args) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) return editor.getPlugin(plugin).options[key];

    if (!(key in store.get('state')) && !(key in store.selectors)) {
      editor.api.debug.error(
        `editor.getOption: ${key as string} option is not defined in plugin ${plugin.key}.`,
        'OPTION_UNDEFINED'
      );
      return;
    }

    return (store.get as any)(key, ...args);
  };
  editor.setOption = (plugin: any, key: any, ...args: any) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) return;

    if (!(key in store.get('state'))) {
      editor.api.debug.error(
        `editor.setOption: ${key} option is not defined in plugin ${plugin.key}.`,
        'OPTION_UNDEFINED'
      );
      return;
    }

    (store.set as any)(key, ...args);
  };
  editor.setOptions = (plugin: any, options: any) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) return;
    if (typeof options === 'object') {
      store.set('state', (draft: any) => {
        Object.assign(draft, options);
      });
    } else if (typeof options === 'function') {
      store.set('state', options);
    }
  };

  // Plugin initialization code
  const corePlugins = getCorePlugins({
    affinity,
    chunking,
    maxLength,
    nodeId,
    plugins,
  });

  let rootPluginInstance = createSlatePlugin({
    key: 'root',
    priority: 10_000,
    ...pluginConfig,
    override: {
      ...pluginConfig.override,
      components: {
        ...pluginConfig.components,
        ...pluginConfig.override?.components,
      },
    },
    plugins: [...corePlugins, ...plugins],
  });

  // Apply rootPlugin configuration if provided
  if (rootPlugin) {
    rootPluginInstance = rootPlugin(rootPluginInstance) as any;
  }

  resolvePlugins(editor, [rootPluginInstance], optionsStoreFactory);

  /** Ignore normalizeNode overrides if shouldNormalizeNode returns false */
  const normalizeNode = editor.tf.normalizeNode;
  editor.tf.normalizeNode = (...args) => {
    if (!editor.api.shouldNormalizeNode(args[0])) {
      return;
    }

    return normalizeNode(...args);
  };
  editor.normalizeNode = editor.tf.normalizeNode;

  if (!skipInitialization) {
    editor.tf.init({
      autoSelect,
      selection,
      shouldNormalizeEditor,
      value,
      onReady: onReady as any,
    });
  }

  return editor as any;
};

export type CreateSlateEditorOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = WithSlateOptions<V, P> & {
  /**
   * Initial editor to be extended with `withSlate`.
   *
   * @default createEditor()
   */
  editor?: Editor;
};

/**
 * Creates a Slate editor (non-React version).
 *
 * This function creates a fully configured Plate editor instance that can be
 * used in non-React environments or server-side contexts. It applies all the
 * specified plugins and configurations to create a functional editor.
 *
 * Examples:
 *
 * ```ts
 * const editor = createSlateEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   value: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom configuration
 * const editor = createSlateEditor({
 *   plugins: [ParagraphPlugin],
 *   maxLength: 1000,
 *   nodeId: { idCreator: () => uuidv4() },
 *   autoSelect: 'end',
 * });
 *
 * // Server-side editor
 * const editor = createSlateEditor({
 *   plugins: [ParagraphPlugin],
 *   value: '<p>HTML content</p>',
 *   skipInitialization: true,
 * });
 * ```
 *
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 * @see {@link withSlate} for the underlying function that applies Slate enhancements to an editor.
 */
export const createSlateEditor = <
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
>({
  editor = createEditor(),
  ...options
}: CreateSlateEditorOptions<V, P> = {}) => withSlate<V, P>(editor, options);
