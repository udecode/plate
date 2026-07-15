import {
  createEditor,
  defineEditorExtension,
  type Editor,
  type EditorExtensionInput,
  type Selection,
  type Value,
} from '@platejs/plite';
import {
  replace as replaceEditorSnapshot,
  setEditorDefaultBlockType,
  setEditorMaxLength,
  setEditorReadOnly,
} from '@platejs/plite/internal';

import type { NoInfer } from '../../internal/types';
import type { PluginStoreFactory } from '../../internal/plugin/resolvePlugins';
import { createPlateChangeHandlersExtension } from '../../internal/plugin/plateChangeHandlers';
import type {
  AnyPluginConfig,
  NodeComponents,
  PluginConfig,
  WithRequiredKey,
} from '../plugin/PluginConfig';
import type {
  AnyBasePlugin,
  BasePlugin,
  BasePluginContext,
  InjectNodeProps,
  PlatePluginTxGroup,
} from '../plugin/BasePlugin';
import type { NodeIdConfig } from '../plugins/node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from '../plugins/paragraph/BaseParagraphPlugin';
import type { InferPlugins, BaseEditor, BasePluginInput } from './BaseEditor';

import { resolvePlugins } from '../../internal/plugin/resolvePlugins';
import { pipeTransformInitialValue } from '../../internal/plugin/pipeTransformInitialValue';
import { createBasePlugin } from '../plugin/createBasePlugin';
import { getBasePlugin, getPluginType } from '../plugin/getBasePlugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';
import {
  type CorePluginConfig,
  getCorePlugins,
} from '../plugins/getCorePlugins';
import { deserializeHtml } from '../plugins/html';

type PluginLookupInput = AnyBasePlugin | WithRequiredKey<BasePluginInput>;
type PluginContextLookupInput = PluginLookupInput | string;

export type EditorValueInput<V extends Value> = V | Readonly<V>;

const normalizeBaseInitialValue = <V extends Value>(
  editor: BaseEditor,
  value: unknown
): V => {
  if (typeof value === 'string') {
    return deserializeHtml(editor, { element: value }) as V;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value as V;
  }

  const currentValue = editor.read.children() as V;

  return currentValue.length > 0
    ? currentValue
    : ([
        {
          children: [{ text: '' }],
          type: editor.getType(BaseParagraphPlugin.key),
        },
      ] as V);
};

const initializeBaseEditor = <V extends Value>(
  editor: BaseEditor,
  {
    autoSelect,
    selection,
    shouldNormalizeEditor,
    value,
    onReady,
  }: {
    autoSelect?: boolean | 'end' | 'start';
    onReady?: (ctx: { editor: BaseEditor; isAsync: boolean; value: V }) => void;
    selection?: Selection;
    shouldNormalizeEditor?: boolean;
    value?:
      | ((
          editor: BaseEditor
        ) => EditorValueInput<V> | Promise<EditorValueInput<V>>)
      | EditorValueInput<V>
      | string
      | null;
  }
) => {
  const applyValue = (nextValueInput: unknown, isAsync = false) => {
    const nextValue = normalizeBaseInitialValue<V>(editor, nextValueInput);
    const selectionInput =
      selection ??
      (autoSelect === true
        ? 'end'
        : autoSelect === 'start' || autoSelect === 'end'
          ? autoSelect
          : null);

    replaceEditorSnapshot(editor, {
      children: nextValue,
      selection: selectionInput,
    });

    pipeTransformInitialValue(editor);

    if (shouldNormalizeEditor) {
      editor.update.normalize({ force: true });
    }

    onReady?.({
      editor,
      isAsync,
      value: editor.read.children() as V,
    });
  };

  if (typeof value === 'function') {
    const result = value(editor);

    if (result && typeof (result as Promise<V>).then === 'function') {
      (result as Promise<V>).then((resolvedValue) => {
        applyValue(resolvedValue, true);
      });
      return;
    }

    applyValue(result);
    return;
  }

  applyValue(value);
};

const PLATE_IMPLICIT_EXTENSION_NAME = Symbol.for(
  'plate.core.implicitExtensionName'
);

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null;

const isPlainObject = (value: unknown): value is Record<PropertyKey, unknown> =>
  isRecord(value) && Object.getPrototypeOf(value) === Object.prototype;

const isImplicitPlateEditorExtension = (
  extension: unknown
): extension is Record<PropertyKey, unknown> & { name: string } =>
  isRecord(extension) &&
  extension[PLATE_IMPLICIT_EXTENSION_NAME] === true &&
  typeof extension.name === 'string';

const markImplicitPlateEditorExtension = <T extends object>(
  extension: T
): T => {
  Object.defineProperty(extension, PLATE_IMPLICIT_EXTENSION_NAME, {
    configurable: true,
    value: true,
  });

  return extension;
};

const mergeEditorExtensionValue = (base: unknown, next: unknown): unknown => {
  if (Array.isArray(base) && Array.isArray(next)) {
    return [...base, ...next];
  }

  if (isPlainObject(base) && isPlainObject(next)) {
    return mergeEditorExtensionObjects(base, next);
  }

  return next;
};

const mergeEditorExtensionObjects = (
  base: Record<PropertyKey, unknown>,
  next: Record<PropertyKey, unknown>
) => {
  const merged: Record<PropertyKey, unknown> = { ...base };

  for (const [key, value] of Object.entries(next)) {
    merged[key] = mergeEditorExtensionValue(merged[key], value);
  }

  return markImplicitPlateEditorExtension(merged);
};

const mergeImplicitPlateEditorExtensions = (extensions: unknown[]) => {
  const mergedExtensions: unknown[] = [];
  const implicitIndexByName = new Map<string, number>();

  for (const extension of extensions) {
    if (!isImplicitPlateEditorExtension(extension)) {
      if (isRecord(extension) && typeof extension.name === 'string') {
        implicitIndexByName.delete(extension.name);
      }

      mergedExtensions.push(extension);
      continue;
    }

    const index = implicitIndexByName.get(extension.name);

    if (index === undefined) {
      implicitIndexByName.set(extension.name, mergedExtensions.length);
      mergedExtensions.push(extension);
      continue;
    }

    mergedExtensions[index] = mergeEditorExtensionObjects(
      mergedExtensions[index] as Record<PropertyKey, unknown>,
      extension
    );
  }

  return mergedExtensions;
};

const normalizePlateEditorExtensions = (extensions: unknown) => {
  if (!extensions) return [];

  return Array.isArray(extensions) ? extensions : [extensions];
};

const resolvePlateEditorExtensions = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
) =>
  mergeImplicitPlateEditorExtensions(
    (plugin.__editorExtensions ?? []).flatMap((extension) =>
      normalizePlateEditorExtensions(
        extension(getEditorPlugin(editor, plugin as any) as never)
      )
    )
  );

const installPlateEditorExtensions = (editor: BaseEditor) => {
  for (const plugin of editor.runtime.pluginList) {
    const extensions = resolvePlateEditorExtensions(editor, plugin);

    for (const extension of extensions) {
      editor.extend(extension as EditorExtensionInput);
    }
  }
};

type PlateRuntimePluginContext = BasePluginContext<AnyPluginConfig>;

const plateTxExtensionCleanups = new WeakMap<object, () => void>();

const createPlateRuntimePluginContext = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): PlateRuntimePluginContext => getEditorPlugin(editor, plugin);

const collectPlateTxGroupFactories = (editor: BaseEditor) => {
  const txGroups = new Map<string, PlatePluginTxGroup[]>();
  const addGroup = (groupKey: string, groupFactory: unknown) => {
    if (!groupFactory) return;

    const list = txGroups.get(groupKey) ?? [];

    list.push(groupFactory as PlatePluginTxGroup);
    txGroups.set(groupKey, list);
  };

  editor.runtime.pluginList.forEach((plugin: AnyBasePlugin) => {
    plugin.__txExtensions.forEach((txExtension) => {
      Object.entries(
        txExtension(createPlateRuntimePluginContext(editor, plugin))
      ).forEach(([groupKey, groupFactory]) => {
        addGroup(groupKey, groupFactory);
      });
    });

    Object.entries(plugin.tx ?? {}).forEach(([groupKey, groupFactory]) => {
      addGroup(groupKey, groupFactory);
    });
  });

  return txGroups;
};

const installPlateRuntimeTxExtensions = (editor: BaseEditor) => {
  plateTxExtensionCleanups.get(editor)?.();
  plateTxExtensionCleanups.delete(editor);

  const txGroups = collectPlateTxGroupFactories(editor);

  if (txGroups.size === 0) return;

  const tx = Object.create(null) as Record<string, PlatePluginTxGroup>;

  txGroups.forEach((groupFactories, groupKey) => {
    tx[groupKey] = (transaction, runtimeEditor, context) => {
      const group = Object.create(null) as Record<string, unknown>;

      groupFactories.forEach((groupFactory) => {
        Object.assign(
          group,
          groupFactory(transaction, runtimeEditor as BaseEditor, context as any)
        );
      });

      return group;
    };
  });

  const cleanup = editor.extend(
    defineEditorExtension({
      name: 'plate-plugin-tx',
      tx,
    })
  );

  plateTxExtensionCleanups.set(editor, cleanup);
};

export type BaseExtendBaseEditorOptions<
  P extends BasePluginInput = CorePluginConfig,
> = {
  /**
   * Unique identifier for the editor instance.
   *
   * @default nanoid()
   */
  id?: string;
  /**
   * Current user ID for collaborative features (e.g., Yjs). Used to identify
   * the creator of elements like combobox inputs.
   */
  userId?: string | null;
  /**
   * Enable mark/element affinity.
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
  /** Specifies the component for each plugin key. */
  components?: NodeComponents;
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
  /**
   * Array of plugins to be loaded into the editor. Plugins extend the editor's
   * functionality and define custom behavior.
   */
  plugins?: readonly P[];
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
  selection?: Selection;
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

export type ExtendBaseEditorOptions<
  V extends Value = Value,
  P extends BasePluginInput = CorePluginConfig,
> = Omit<BaseExtendBaseEditorOptions<P>, 'id'> &
  Pick<
    Partial<AnyBasePlugin>,
    | 'api'
    | 'decorate'
    | 'inject'
    | 'transformInitialValue'
    | 'options'
    | 'override'
  > & {
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
    value?:
      | ((
          editor: BaseEditor
        ) =>
          | EditorValueInput<NoInfer<V>>
          | Promise<EditorValueInput<NoInfer<V>>>)
      | EditorValueInput<NoInfer<V>>
      | string
      | null;
    /** Function to configure the root plugin */
    rootPlugin?: (plugin: AnyBasePlugin) => AnyBasePlugin;
    /**
     * Callback called when the editor is ready (after initialization
     * completes).
     */
    onReady?: (ctx: {
      editor: BaseEditor;
      isAsync: boolean;
      value: NoInfer<V>;
    }) => void;
  };

/**
 * Applies Plate enhancements to an editor instance (non-React version).
 *
 * @remarks
 *   This function supports server-side usage as it doesn't include React-specific
 *   features like component rendering or hooks integration.
 * @see {@link createBaseEditor} for a higher-level non-React editor creation function.
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 * @see {@link extendPlateEditor} for the React-specific enhancement function.
 */
export const extendBaseEditor = <
  V extends Value = Value,
  P extends BasePluginInput = CorePluginConfig,
>(
  e: Editor,
  {
    affinity,
    autoSelect,
    maxLength,
    nodeId,
    optionsStoreFactory,
    plugins = [],
    readOnly,
    rootPlugin,
    selection,
    shouldNormalizeEditor,
    skipInitialization,
    userId,
    value,
    onReady,
    ...pluginConfig
  }: ExtendBaseEditorOptions<V, P> = {}
): BaseEditor<V, CorePluginConfig | InferPlugins<P[]>> => {
  const editor = e as unknown as BaseEditor;

  editor.runtime = editor.runtime ?? ({} as BaseEditor['runtime']);
  editor.runtime.isFallback = false;
  editor.runtime.userId = userId;
  if (readOnly !== undefined) {
    setEditorReadOnly(editor, readOnly);
  }
  if (maxLength !== undefined) {
    setEditorMaxLength(editor, maxLength);
  }

  editor.getPlugin = ((plugin: PluginLookupInput) =>
    getBasePlugin(editor, plugin)) as BaseEditor['getPlugin'];
  editor.plugin = ((plugin: PluginContextLookupInput) =>
    getEditorPlugin(
      editor,
      typeof plugin === 'string' ? { key: plugin } : plugin
    )) as BaseEditor['plugin'];
  editor.getType = (pluginKey) => getPluginType(editor, pluginKey);
  editor.getInjectProps = (<C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ): InjectNodeProps<C> => {
    const resolvedPlugin = getBasePlugin(editor, plugin) as BasePlugin<C>;
    const nodeProps = (resolvedPlugin.inject?.nodeProps ??
      {}) as InjectNodeProps<C>;

    nodeProps.nodeKey = nodeProps.nodeKey ?? editor.getType(plugin.key);
    nodeProps.styleKey = nodeProps.styleKey ?? nodeProps.nodeKey;

    return nodeProps;
  }) satisfies BaseEditor['getInjectProps'];
  editor.getOptionsStore = (plugin) =>
    getBasePlugin(editor, plugin).optionsStore;

  const pluginList = [...plugins];
  const corePlugins = getCorePlugins({
    affinity,
    nodeId,
    plugins: pluginList,
  });

  let rootPluginInstance: AnyBasePlugin = (createBasePlugin as any)({
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
    plugins: [...corePlugins, ...pluginList],
  }) as AnyBasePlugin;

  if (rootPlugin) {
    rootPluginInstance = rootPlugin(rootPluginInstance) as any;
  }

  resolvePlugins(editor, [rootPluginInstance], optionsStoreFactory);
  setEditorDefaultBlockType(editor, editor.getType(BaseParagraphPlugin.key));
  installPlateEditorExtensions(editor);
  editor.extend(createPlateChangeHandlersExtension(editor));
  installPlateRuntimeTxExtensions(editor);

  if (!skipInitialization) {
    initializeBaseEditor(editor, {
      autoSelect,
      selection,
      shouldNormalizeEditor,
      value,
      onReady: onReady as any,
    });
  }

  return editor as any;
};

export type CreateBaseEditorOptions<
  V extends Value = Value,
  P extends
    readonly CreateBaseEditorPluginInput[] = readonly CreateBaseEditorPluginInput[],
> = Omit<ExtendBaseEditorOptions<V, BasePluginInput>, 'plugins'> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /**
   * Initial editor to be extended with `extendBaseEditor`.
   *
   * @default createEditor()
   */
  editor?: Editor;
  /**
   * Array of plugins to be loaded into the editor. Plugins extend the editor's
   * functionality and define custom behavior.
   */
  plugins?: P;
};

type CreateBaseEditorPluginInput<C extends AnyPluginConfig = AnyPluginConfig> =
  | BasePlugin<C>
  | AnyPluginConfig;

type InferCreateBaseEditorPluginConfig<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : P extends BasePlugin<infer C>
    ? C
    : P extends AnyPluginConfig
      ? P
      : never;

type InferCreateBaseEditorPlugins<P extends readonly unknown[]> =
  InferCreateBaseEditorPluginConfig<P[number]>;

/**
 * Creates a base Plate editor (non-React version).
 *
 * This function creates a fully configured base editor on top of Plite for
 * non-React environments or server-side contexts. It applies the specified
 * plugins and configuration to create a functional editor.
 *
 * Examples:
 *
 * ```ts
 * const editor = createBaseEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   value: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom configuration
 * const editor = createBaseEditor({
 *   plugins: [ParagraphPlugin],
 *   maxLength: 1000,
 *   nodeId: { idCreator: () => uuidv4() },
 *   autoSelect: 'end',
 * });
 *
 * // Server-side editor
 * const editor = createBaseEditor({
 *   plugins: [ParagraphPlugin],
 *   value: '<p>HTML content</p>',
 *   skipInitialization: true,
 * });
 * ```
 *
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 * @see {@link extendBaseEditor} for the underlying function that applies base Plate enhancements to an editor.
 */
export function createBaseEditor<
  V extends Value = Value,
  const P extends readonly CreateBaseEditorPluginInput[] = readonly [],
>(
  options: CreateBaseEditorOptions<V, P> & { plugins: P }
): BaseEditor<V, InferCreateBaseEditorPlugins<P>>;
export function createBaseEditor<V extends Value = Value>(
  options?: CreateBaseEditorOptions<V>
): BaseEditor<V, CorePluginConfig>;
export function createBaseEditor<
  V extends Value = Value,
  const P extends readonly CreateBaseEditorPluginInput[] = readonly [],
>({
  editor,
  id,
  ...options
}: CreateBaseEditorOptions<V, P> = {}): BaseEditor<
  V,
  InferCreateBaseEditorPlugins<P>
> {
  const baseEditor =
    editor ??
    createEditor({
      id,
      maxLength: options.maxLength,
      readOnly: options.readOnly,
    });

  return extendBaseEditor<V, BasePluginInput>(
    baseEditor,
    options as unknown as ExtendBaseEditorOptions<V, InferPlugins<P>>
  ) as unknown as BaseEditor<V, InferCreateBaseEditorPlugins<P>>;
}
