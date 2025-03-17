import {
  type Editor,
  type TSelection,
  type Value,
  createEditor,
} from '@udecode/slate';
import { nanoid } from 'nanoid';

import type { AnyPluginConfig } from '../plugin/BasePlugin';
import type { AnySlatePlugin } from '../plugin/SlatePlugin';
import type { InferPlugins, SlateEditor, TSlateEditor } from './SlateEditor';

import { pipeNormalizeInitialValue } from '../../internal/plugin/pipeNormalizeInitialValue';
import { resolvePlugins } from '../../internal/plugin/resolvePlugins';
import { createSlatePlugin } from '../plugin/createSlatePlugin';
import { getPluginType, getSlatePlugin } from '../plugin/getSlatePlugin';
import { type CorePlugin, getCorePlugins } from '../plugins/getCorePlugins';

export type BaseWithSlateOptions<P extends AnyPluginConfig = CorePlugin> = {
  id?: string;
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
  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;
  plugins?: P[];
  selection?: TSelection;
  /**
   * When `true`, it will normalize the initial `value` passed to the `editor`.
   * This is useful when adding normalization rules on already existing
   * content.
   *
   * @default false
   */
  shouldNormalizeEditor?: boolean;
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
    value?: ((editor: SlateEditor) => V) | V | string;
    /** Function to configure the root plugin */
    rootPlugin?: (plugin: AnySlatePlugin) => AnySlatePlugin;
  };

/**
 * Applies Plate enhancements to an editor instance (non-React version).
 *
 * @remarks
 *   This function supports server-side usage as it doesn't include the
 *   ReactPlugin.
 * @see {@link createSlateEditor} for a higher-level non-React editor creation function.
 * @see {@link createPlateEditor} for a higher-level React editor creation function.
 * @see {@link usePlateEditor} for a React memoized version.
 * @see {@link withPlate} for the React-specific enhancement function.
 */
export const withSlate = <
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
>(
  e: Editor,
  {
    id,
    autoSelect,
    maxLength,
    plugins = [],
    rootPlugin,
    selection,
    shouldNormalizeEditor,
    value,
    ...pluginConfig
  }: WithSlateOptions<V, P> = {}
): TSlateEditor<V, InferPlugins<P[]>> => {
  const editor = e as SlateEditor;

  editor.id = id ?? editor.id ?? nanoid();
  editor.key = editor.key ?? nanoid();
  editor.isFallback = false;
  editor.prevSelection = null;
  editor.currentKeyboardEvent = null;

  editor.getApi = () => editor.api as any;
  editor.getTransforms = () => editor.transforms as any;
  editor.getPlugin = (plugin) => getSlatePlugin(editor, plugin) as any;
  editor.getType = (plugin) => getPluginType(editor, plugin);
  editor.getInjectProps = (plugin) => {
    return (
      editor.getPlugin<AnySlatePlugin>(plugin).inject?.nodeProps ?? ({} as any)
    );
  };
  editor.getOptionsStore = (plugin) => {
    return editor.getPlugin(plugin).optionsStore;
  };
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
    maxLength,
    plugins,
  });

  let rootPluginInstance = createSlatePlugin({
    key: 'root',
    priority: 10_000,
    ...pluginConfig,
    plugins: [...corePlugins, ...plugins],
  });

  // Apply rootPlugin configuration if provided
  if (rootPlugin) {
    rootPluginInstance = rootPlugin(rootPluginInstance) as any;
  }

  resolvePlugins(editor, [rootPluginInstance]);

  if (typeof value === 'string') {
    editor.children = editor.api.html.deserialize({ element: value }) as Value;
  } else if (typeof value === 'function') {
    editor.children = value(editor);
  } else if (value) {
    editor.children = value;
  }
  if (!editor.children || editor.children?.length === 0) {
    editor.children = editor.api.create.value();
  }
  if (selection) {
    editor.selection = selection;
  } else if (autoSelect) {
    const edge = autoSelect === 'start' ? 'start' : 'end';
    const target = edge === 'start' ? editor.api.start([]) : editor.api.end([]);
    editor.tf.select(target!);
  }
  if (editor.children.length > 0) {
    pipeNormalizeInitialValue(editor);
  }
  if (shouldNormalizeEditor) {
    editor.tf.normalize({ force: true });
  }

  return editor as any;
};

export type CreateSlateEditorOptions<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = WithSlateOptions<V, P> & {
  /**
   * Initial editor to be extended with `withPlate`.
   *
   * @default createEditor()
   */
  editor?: Editor;
};

/**
 * Creates a Slate editor without React-specific enhancements.
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
}: CreateSlateEditorOptions<V, P> = {}) => {
  return withSlate<V, P>(editor, options);
};
