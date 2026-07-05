import {
  createEditor,
  defineEditorExtension,
  ElementApi,
  NodeApi,
  OperationApi,
  type Editor,
  type EditorExtensionInput,
  type Path,
  PathApi,
  type Point,
  type Selection,
  type Value,
} from '@platejs/plite';
import {
  getOperationRoot,
  MAIN_ROOT_KEY,
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
} from '../plugin/SlatePlugin';
import type {
  AnyBasePlugin,
  BasePlugin,
  BasePluginContext,
  InjectNodeProps,
  PlatePluginTxGroup,
} from '../plugin/BasePlugin';
import type { NodeIdConfig } from '../plugins/node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from '../plugins/paragraph/BaseParagraphPlugin';
import type { InferPlugins, BaseEditor, BasePluginInput } from './SlateEditor';

import { resolvePlugins } from '../../internal/plugin/resolvePlugins';
import { pipeTransformInitialValue } from '../../internal/plugin/pipeTransformInitialValue';
import { createBasePlugin } from '../plugin/createBasePlugin';
import {
  getPluginByType,
  getPluginType,
  getSlatePlugin,
} from '../plugin/getSlatePlugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';
import {
  type CorePluginConfig,
  getCorePlugins,
} from '../plugins/getCorePlugins';
import { deserializeHtml } from '../plugins/html';

type PluginLookupInput = AnyBasePlugin | WithRequiredKey<BasePluginInput>;

const getBaseRuntimeChildren = (node: unknown) =>
  node &&
  typeof node === 'object' &&
  'children' in node &&
  Array.isArray((node as { children?: unknown }).children)
    ? (node as { children: unknown[] }).children
    : null;

const isBaseRuntimeTextNode = (node: unknown): node is { text: string } =>
  node !== null &&
  typeof node === 'object' &&
  'text' in node &&
  typeof (node as { text?: unknown }).text === 'string';

const getBaseRuntimeNodeAtPath = (value: Readonly<Value>, path: number[]) => {
  let node: unknown = value[path[0]];

  for (const index of path.slice(1)) {
    const children = getBaseRuntimeChildren(node);

    if (!children) return;

    node = children[index];
  }

  return node;
};

const getBaseRuntimeValueEdgePoint = (
  value: Readonly<Value>,
  edge: 'end' | 'start'
): Point | null => {
  if (value.length === 0) return null;

  const path = [edge === 'start' ? 0 : value.length - 1];
  let node = getBaseRuntimeNodeAtPath(value, path);

  while (!isBaseRuntimeTextNode(node)) {
    const children = getBaseRuntimeChildren(node);

    if (!children || children.length === 0) return null;

    const nextIndex = edge === 'start' ? 0 : children.length - 1;
    path.push(nextIndex);
    node = children[nextIndex];
  }

  return {
    offset: edge === 'start' ? 0 : node.text.length,
    path,
  };
};

const getBaseRuntimeTextPointAtPath = (
  value: Readonly<Value>,
  path: Path,
  offset: number
): Point | null => {
  const nextPath = [...path];
  let node = getBaseRuntimeNodeAtPath(value, nextPath);

  while (node && !isBaseRuntimeTextNode(node)) {
    const children = getBaseRuntimeChildren(node);

    if (!children || children.length === 0) return null;

    nextPath.push(0);
    node = children[0];
  }

  if (!isBaseRuntimeTextNode(node)) return null;

  return {
    offset: Math.min(offset, node.text.length),
    path: nextPath,
  };
};

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

const resolveBaseInitialSelection = (
  editor: BaseEditor,
  value: Readonly<Value>,
  selection?: Selection,
  autoSelect?: boolean | 'end' | 'start'
) => {
  const asTextPoint = (point: Point | null | undefined) => {
    if (!point) return null;

    try {
      const node = editor.read.nodes.get(point.path)?.[0];

      if (node && NodeApi.isText(node)) return point;
    } catch {}

    return null;
  };
  const resolvePoint = (point: Point) => {
    const transformedPoint = getBaseRuntimeTextPointAtPath(
      value,
      point.path,
      point.offset
    );

    try {
      return (
        asTextPoint(point) ??
        transformedPoint ??
        asTextPoint(editor.read.points.start(point.path)) ??
        asTextPoint(editor.read.points.start([]))
      );
    } catch {
      try {
        return asTextPoint(editor.read.points.start([]));
      } catch {
        return null;
      }
    }
  };

  if (selection) {
    const anchor = resolvePoint(selection.anchor);
    const focus = resolvePoint(selection.focus);

    return anchor && focus ? { anchor, focus } : null;
  }

  const edge =
    autoSelect === true ? 'end' : autoSelect === 'start' ? 'start' : autoSelect;
  const point = edge ? getBaseRuntimeValueEdgePoint(value, edge) : null;

  return point ? { anchor: point, focus: point } : null;
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
    value?: ((editor: BaseEditor) => Promise<V> | V) | V | string | null;
  }
) => {
  const applyValue = (nextValueInput: unknown, isAsync = false) => {
    const nextValue = normalizeBaseInitialValue<V>(editor, nextValueInput);

    editor.update(
      (tx) => {
        tx.value.replace({ children: nextValue, selection: null });
      },
      { metadata: { history: { mode: 'skip' } }, skipNormalize: true }
    );

    pipeTransformInitialValue(editor);

    const currentValue = editor.read.children() as V;
    const nextSelection = resolveBaseInitialSelection(
      editor,
      currentValue,
      selection,
      autoSelect
    );

    if (nextSelection) {
      editor.update(
        (tx) => {
          tx.selection.set(nextSelection);
        },
        { metadata: { history: { mode: 'skip' } } }
      );
    }

    if (shouldNormalizeEditor) {
      editor.update((tx) => {
        tx.normalize({ force: true });
      });
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

const installPlateNormalizeRulesExtension = (editor: BaseEditor) => {
  const hasNormalizeRules = editor.runtime.pluginList.some(
    (plugin) => plugin.rules?.normalize || plugin.rules?.match
  );

  if (!hasNormalizeRules) return;

  editor.extend(
    defineEditorExtension({
      name: 'plate:normalize-rules:plite',
      normalizers: {
        node({ entry, next, tx }) {
          const [node, path] = entry;

          if (!ElementApi.isElement(node) || typeof node.type !== 'string') {
            next();
            return;
          }

          const plugin = getPluginByType(editor, node.type);
          const normalizeRules = plugin?.rules.normalize;
          const overridePlugin = editor.runtime.pluginCache.rules.match
            .map((key) => editor.getPlugin({ key }))
            .find(
              (candidate) =>
                candidate.rules?.normalize &&
                candidate.rules.match?.({
                  editor,
                  node,
                  path,
                  plugin: candidate,
                  rule: 'normalize.removeEmpty',
                  type: candidate.node.type,
                } as never)
            );
          const effectiveNormalizeRules =
            overridePlugin?.rules.normalize ?? normalizeRules;
          const text = editor.read.text.string(path as never);

          if (effectiveNormalizeRules?.removeEmpty && text.length === 0) {
            tx.nodes.remove({ at: path });
            return;
          }

          next();
        },
      },
    })
  );
};

const getRuntimeChildren = (node: unknown) =>
  node &&
  typeof node === 'object' &&
  'children' in node &&
  Array.isArray((node as { children?: unknown }).children)
    ? (node as { children: unknown[] }).children
    : null;

const isRuntimeTextNode = (node: unknown): node is { text: string } =>
  node !== null &&
  typeof node === 'object' &&
  'text' in node &&
  typeof (node as { text?: unknown }).text === 'string';

const isRuntimeElementNode = (node: unknown): node is { children: unknown[] } =>
  node !== null &&
  typeof node === 'object' &&
  !isRuntimeTextNode(node) &&
  Array.isArray((node as { children?: unknown }).children);

const getRuntimeNodeText = (node: unknown): string => {
  if (isRuntimeTextNode(node)) return node.text;

  const children = getRuntimeChildren(node);

  if (!children) return '';

  return children.map(getRuntimeNodeText).join('');
};

const getRuntimeDescendant = (
  editor: BaseEditor,
  path: number[],
  root?: string
) => {
  try {
    const rootValue = editor.read((state) =>
      root === MAIN_ROOT_KEY ? state.children() : state.root(root as never)
    );
    let node: unknown = rootValue;

    for (const index of path) {
      const children = getRuntimeChildren(node);

      if (!children?.[index]) return;

      node = children[index];
    }

    return node;
  } catch {
    return;
  }
};

const getMergeOverrideRules = (
  editor: BaseEditor,
  rule: string,
  node: Record<string, unknown>,
  path: number[]
) => {
  for (const key of editor.runtime.pluginCache.rules.match) {
    const plugin = editor.getPlugin({ key });
    const match = plugin?.rules?.match;

    if (
      plugin?.rules?.merge &&
      typeof match === 'function' &&
      match({
        editor,
        node,
        path,
        plugin,
        rule,
        type: plugin.node.type,
      } as never)
    ) {
      return plugin.rules.merge;
    }
  }

  return null;
};

const shouldRemoveEmptyMergeTarget = (
  editor: BaseEditor,
  node: Record<string, unknown>,
  path: number[]
) => {
  const type = typeof node.type === 'string' ? node.type : undefined;
  const plugin = type ? getPluginByType(editor, type) : undefined;

  if (!plugin) return true;
  if (!plugin.rules?.merge?.removeEmpty) return false;

  const overrideRules = getMergeOverrideRules(
    editor,
    'merge.removeEmpty',
    node,
    path
  );

  return overrideRules?.removeEmpty !== false;
};

const getMergeNodeProperties = (node: { children: unknown[] }) => {
  const { children: _children, ...properties } = node;

  return properties;
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
type PlateRuntimePluginInput = Parameters<BaseEditor['getOptions']>[0];

const plateTxExtensionCleanups = new WeakMap<object, () => void>();

const asPlateArg = <T>(value: unknown): T => value as T;

const asPluginInput = (plugin: AnyBasePlugin): PlateRuntimePluginInput =>
  plugin as unknown as PlateRuntimePluginInput;

const createPlateRuntimePluginContext = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): PlateRuntimePluginContext =>
  ({
    api: editor.api,
    editor,
    plugin,
    type: plugin.node?.type ?? plugin.key,
    getOption: ((key: PropertyKey, ...args: unknown[]) =>
      (editor.getOption as unknown as (...input: unknown[]) => unknown)(
        plugin,
        key,
        ...args
      )) as PlateRuntimePluginContext['getOption'],
    getOptions: () => editor.getOptions(asPluginInput(plugin)),
    setOption: (key: string | Record<string, unknown>, value?: unknown) => {
      const pluginInput = asPluginInput(plugin);

      if (typeof key === 'string') {
        editor.setOption(
          pluginInput,
          asPlateArg<Parameters<BaseEditor['setOption']>[1]>(key),
          asPlateArg<Parameters<BaseEditor['setOption']>[2]>(value)
        );
        return;
      }

      editor.setOptions(
        pluginInput,
        asPlateArg<Parameters<BaseEditor['setOptions']>[1]>(key)
      );
    },
    setOptions: (
      options:
        | ((state: Record<string, unknown>) => void)
        | Record<string, unknown>
    ) => {
      editor.setOptions(
        asPluginInput(plugin),
        asPlateArg<Parameters<BaseEditor['setOptions']>[1]>(options)
      );
    },
  }) as PlateRuntimePluginContext;

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

const installPlateMergeRulesExtension = (editor: BaseEditor) => {
  const hasMergeRules = editor.runtime.pluginList.some(
    (plugin) => plugin.rules?.merge || plugin.rules?.match
  );

  if (!hasMergeRules) return;

  editor.extend(
    defineEditorExtension({
      name: 'plate:merge-rules:plite',
      operations: {
        apply({ operation, next }) {
          if (
            OperationApi.isRemoveNodeOperation(operation) &&
            isRuntimeElementNode(operation.node) &&
            operation.node.children.length > 0 &&
            operation.path.length > 0 &&
            getRuntimeNodeText(operation.node).length === 0 &&
            !shouldRemoveEmptyMergeTarget(
              editor,
              operation.node as Record<string, unknown>,
              operation.path
            )
          ) {
            const operationExplicitRoot =
              'root' in operation ? operation.root : undefined;
            const nextPath = PathApi.next(operation.path);
            const nextNode = getRuntimeDescendant(
              editor,
              nextPath,
              getOperationRoot(operation)
            );

            if (isRuntimeElementNode(nextNode)) {
              for (
                let index = operation.node.children.length - 1;
                index >= 0;
                index--
              ) {
                next({
                  node: operation.node.children[index],
                  path: [...operation.path, index],
                  root: operationExplicitRoot,
                  type: 'remove_node',
                } as never);
              }

              next({
                path: nextPath,
                position: 0,
                properties: getMergeNodeProperties(nextNode),
                root: operationExplicitRoot,
                type: 'merge_node',
              } as never);
              return;
            }
          }

          next(operation);
        },
      },
      queries: {
        nodes: {
          shouldMergeNodesRemovePrevNode({ current, next, previous }) {
            const [previousNode, previousPath] = previous;
            const [, currentPath] = current;

            if (
              isRuntimeTextNode(previousNode) &&
              previousNode.text === '' &&
              previousPath.at(-1) !== 0
            ) {
              return true;
            }

            if (
              isRuntimeElementNode(previousNode) &&
              getRuntimeNodeText(previousNode).length === 0 &&
              PathApi.isSibling(previousPath, currentPath)
            ) {
              return shouldRemoveEmptyMergeTarget(
                editor,
                previousNode as Record<string, unknown>,
                previousPath
              );
            }

            return next({ current, previous });
          },
        },
      },
    })
  );
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
      | ((editor: BaseEditor) => Promise<NoInfer<V>> | NoInfer<V>)
      | NoInfer<V>
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
    getSlatePlugin(editor, plugin)) as BaseEditor['getPlugin'];
  editor.getType = (pluginKey) => getPluginType(editor, pluginKey);
  editor.getInjectProps = (<C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ): InjectNodeProps<C> => {
    const resolvedPlugin = getSlatePlugin(editor, plugin) as BasePlugin<C>;
    const nodeProps = (resolvedPlugin.inject?.nodeProps ??
      {}) as InjectNodeProps<C>;

    nodeProps.nodeKey = nodeProps.nodeKey ?? editor.getType(plugin.key);
    nodeProps.styleKey = nodeProps.styleKey ?? nodeProps.nodeKey;

    return nodeProps;
  }) satisfies BaseEditor['getInjectProps'];
  editor.getOptionsStore = (plugin) =>
    getSlatePlugin(editor, plugin).optionsStore;
  editor.getOptions = (plugin) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) return getSlatePlugin(editor, plugin).options;

    return editor.getOptionsStore(plugin).get('state');
  };
  editor.getOption = ((plugin: any, key: PropertyKey, ...args: unknown[]) => {
    const store = editor.getOptionsStore(plugin as never) as any;

    if (!store) return editor.getPlugin(plugin).options[key as never];

    if (!(key in store.get('state')) && !(key in store.selectors)) {
      editor.api.debug.error(
        `editor.getOption: ${key as string} option is not defined in plugin ${plugin.key}.`,
        'OPTION_UNDEFINED'
      );
      return;
    }

    return (store.get as any)(key, ...args);
  }) as BaseEditor['getOption'];
  editor.setOption = ((plugin, key, value) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) return;

    if (!(key in store.get('state'))) {
      editor.api.debug.error(
        `editor.setOption: ${String(key)} option is not defined in plugin ${plugin.key}.`,
        'OPTION_UNDEFINED'
      );
      return;
    }

    store.set(key, value);
  }) as BaseEditor['setOption'];
  editor.setOptions = ((plugin, options) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) return;
    if (typeof options === 'object') {
      store.set('state', (draft) => {
        Object.assign(draft, options);
      });
    } else if (typeof options === 'function') {
      store.set('state', options);
    }
  }) as BaseEditor['setOptions'];

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
  installPlateMergeRulesExtension(editor);
  installPlateNormalizeRulesExtension(editor);

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
  | AnyPluginConfig
  | (WithRequiredKey<C> & {
      readonly __config: C;
    });

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
