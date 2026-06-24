import {
  defineEditorExtension,
  ElementApi,
  NodeApi,
  OperationApi,
  PathApi,
  RangeApi,
  type EditorElementSpec,
  type Location,
  type Node,
  type Path,
  type Point,
  type Selection,
  type Value,
} from '@platejs/plite';
import { pathRef, pathRefs } from '@platejs/plite/internal';
import { nanoid } from 'nanoid';

import type { NoInfer } from '../../internal/types';
import type { PluginStoreFactory } from '../../internal/plugin/resolvePlugins';
import {
  createCurrentRuntimeEditor,
  getCurrentRuntimeTransforms,
  installCurrentRuntimeInputRulesExtension,
  installCurrentRuntimeTransforms,
  type CurrentRuntimeEditor as Editor,
} from '../../internal/currentRuntimeBridge';
import type { NodeComponents } from '../plugin/BasePlugin';
import type { AnyEditorPlugin } from '../plugin/EditorPlugin';
import type { ChunkingConfig } from '../plugins/chunking';
import type { NavigationFeedbackConfig } from '../plugins/navigation-feedback';
import type { NodeIdConfig } from '../plugins/node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from '../plugins/paragraph/BaseParagraphPlugin';
import type {
  InferPlugins,
  BasePlateEditor,
  EditorPluginInput,
  TBasePlateEditor,
} from './BasePlateEditor';

import { resolvePlugins } from '../../internal/plugin/resolvePlugins';
import { pipeTransformInitialValue } from '../../internal/plugin/pipeTransformInitialValue';
import { createEditorPlugin } from '../plugin/createEditorPlugin';
import {
  getPluginByType,
  getPluginType,
  getEditorPluginInstance,
} from '../plugin/getEditorPluginInstance';
import { type CorePlugin, getCorePlugins } from '../plugins/getCorePlugins';
import { installPlateRuntimeTxExtensions } from '../../internal/editor/runtimeTxExtensions';

const installPlateRuntimeStateMirrors = (editor: BasePlateEditor) => {
  const defineMirror = (key: PropertyKey, descriptor: PropertyDescriptor) => {
    if (Object.hasOwn(editor, key)) return;

    Object.defineProperty(editor, key, {
      configurable: true,
      enumerable: true,
      ...descriptor,
    });
  };

  defineMirror('children', {
    get: () => editor.read((state) => state.value.root()) as Value,
    set: (value: Value) => {
      editor.update((tx) => {
        tx.value.replace({ children: value, selection: null });
      });
    },
  });
  defineMirror('selection', {
    get: () => editor.read((state) => state.selection.get()),
    set: (selection: Selection) => {
      editor.update((tx) => {
        if (selection) {
          tx.selection.set(selection);
        } else {
          tx.selection.clear();
        }
      });
    },
  });
  defineMirror('marks', {
    get: () => editor.read((state) => state.marks.get()),
    set: (marks: BasePlateEditor['marks']) => {
      editor.update((tx) => {
        tx.marks.set(marks);
      });
    },
  });
  defineMirror('operations', {
    get: () => editor.read((state) => [...state.value.operations()]),
  });
  defineMirror('history', {
    get: () =>
      editor.read((state: any) => state.history?.get?.()) ?? editor.api.history,
  });
  defineMirror('undo', {
    value: () => {
      editor.update((tx) => {
        (tx as any).history?.undo?.();
      });
    },
  });
  defineMirror('redo', {
    value: () => {
      editor.update((tx) => {
        (tx as any).history?.redo?.();
      });
    },
  });
};

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

const normalizeBaseInitialValue = <V extends Value>(
  editor: BasePlateEditor,
  value: unknown
): V => {
  if (typeof value === 'string') {
    return editor.api.html.deserialize({ element: value }) as V;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value as V;
  }

  const currentValue = editor.read((state) => state.value.root()) as V;

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
  editor: BasePlateEditor,
  value: Readonly<Value>,
  selection?: Selection,
  autoSelect?: boolean | 'end' | 'start'
) => {
  const asTextPoint = (point: Point | null | undefined) => {
    if (!point) return null;

    try {
      const node = editor.api.node(point.path)?.[0];

      if (node && NodeApi.isText(node)) return point;
    } catch {}

    return null;
  };
  const resolvePoint = (point: Point) => {
    try {
      return (
        asTextPoint(point) ??
        asTextPoint(editor.api.start(point.path)) ??
        asTextPoint(editor.api.start([]))
      );
    } catch {
      try {
        return asTextPoint(editor.api.start([]));
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

const initializeBasePlateEditor = <V extends Value>(
  editor: BasePlateEditor,
  {
    autoSelect,
    selection,
    shouldNormalizeEditor,
    value,
    onReady,
  }: {
    autoSelect?: boolean | 'end' | 'start';
    onReady?: (ctx: {
      editor: BasePlateEditor;
      isAsync: boolean;
      value: V;
    }) => void;
    selection?: Selection;
    shouldNormalizeEditor?: boolean;
    value?: ((editor: BasePlateEditor) => Promise<V> | V) | V | string | null;
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

    const currentValue = editor.read((state) => state.value.root()) as V;
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
      value: editor.read((state) => state.value.root()) as V,
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

const installPlateRuntimeApiFacade = (editor: BasePlateEditor) => {
  const pliteApi = editor.api as Record<PropertyKey, unknown>;
  const plateApi = Object.create(null) as Record<PropertyKey, unknown>;
  const matchesObject = (node: Node, objectMatch: Record<string, unknown>) =>
    Object.entries(objectMatch).every(([key, expected]) => {
      const actual = (node as Record<string, unknown>)[key];

      return Array.isArray(expected)
        ? expected.includes(actual)
        : actual === expected;
    });
  const normalizeMatch = (match: unknown) => {
    if (!match || typeof match === 'function') return match;
    if (typeof match !== 'object') return;

    return (node: Node) =>
      matchesObject(node, match as Record<string, unknown>);
  };
  const normalizeNodeOptions = (options: Record<string, unknown> = {}) => {
    const match = normalizeMatch(options.match);

    return match ? { ...options, match } : options;
  };
  const normalizeBlockOptions = (options: Record<string, unknown> = {}) => {
    if (!options.block) return normalizeNodeOptions(options);

    const optionMatch = normalizeMatch(options.match);

    return {
      ...options,
      match: (node: Node, path: Path) =>
        ElementApi.isElement(node) &&
        !isInline(node) &&
        (typeof optionMatch === 'function'
          ? (optionMatch as (node: Node, path: Path) => boolean)(node, path)
          : true),
    };
  };
  const matchesNodeOptions = (
    node: Node,
    path: Path,
    options: Record<string, unknown>
  ) => {
    const match = normalizeMatch(options.match);

    return typeof match === 'function'
      ? (match as (node: Node, path: Path) => boolean)(node, path)
      : true;
  };
  const getElementPlugin = (element: unknown) =>
    ElementApi.isElement(element) && typeof element.type === 'string'
      ? getPluginByType(editor, element.type)
      : null;
  const isInline = (element: unknown) =>
    ElementApi.isElement(element) &&
    (getElementPlugin(element)?.node.isInline === true ||
      editor.read((state) => state.schema.isInline(element)));
  const getBlockPath = (point: Point) =>
    editor.read(
      (state) =>
        state.nodes.above({
          at: point,
          match: (node) =>
            ElementApi.isElement(node) && state.schema.isBlock(node),
        })?.[1]
    );

  Object.assign(plateApi, {
    above: (options: Record<string, unknown> = {}) => {
      const atTarget =
        (options.at as Location | undefined) ??
        editor.read((state) => state.selection.get());
      const at = RangeApi.isRange(atTarget) ? atTarget.anchor : atTarget;

      if (!at) return;

      return editor.read((state) =>
        state.nodes.above(normalizeNodeOptions({ ...options, at }) as never)
      );
    },
    after: (at: unknown, options: Record<string, unknown> = {}) =>
      editor.read((state) => state.points.after(at as never, options)),
    before: (at: unknown, options: Record<string, unknown> = {}) =>
      editor.read((state) => state.points.before(at as never, options)),
    block: (options: Record<string, unknown> = {}) => {
      const atTarget =
        (options.at as Location | undefined) ??
        editor.read((state) => state.selection.get());
      const at = RangeApi.isRange(atTarget) ? atTarget.anchor : atTarget;

      if (!at) return;

      const optionMatch = normalizeMatch(options.match);

      if (Array.isArray(at) && !options.above) {
        const entry = editor.read((state) => state.nodes.get(at as never));

        if (
          entry?.[0] &&
          ElementApi.isElement(entry[0]) &&
          !isInline(entry[0]) &&
          (typeof optionMatch === 'function'
            ? (optionMatch as (node: Node, path: Path) => boolean)(
                entry[0],
                entry[1]
              )
            : true)
        ) {
          return entry;
        }
      }

      return editor.read((state) =>
        state.nodes.above({
          ...options,
          at,
          match: (node: Node, path: Path) =>
            ElementApi.isElement(node) &&
            !isInline(node) &&
            (typeof optionMatch === 'function'
              ? (optionMatch as (node: Node, path: Path) => boolean)(node, path)
              : true),
        } as never)
      );
    },
    end: (at: unknown) => editor.read((state) => state.points.end(at as never)),
    edges: (at: unknown) =>
      editor.read((state) => state.ranges.edges(at as never)),
    isBlock: (element: unknown) =>
      ElementApi.isElement(element) && !isInline(element),
    isCollapsed: () =>
      editor.read((state) => {
        const selection = state.selection.get();

        return !!selection && RangeApi.isCollapsed(selection);
      }),
    isAt: (options: Record<string, unknown> = {}) => {
      const selection =
        (options.at as Selection | undefined) ??
        editor.read((state) => state.selection.get());

      if (!selection) return false;

      const anchorBlockPath = getBlockPath(selection.anchor);
      const focusBlockPath = getBlockPath(selection.focus);
      const sameBlock =
        !!anchorBlockPath &&
        !!focusBlockPath &&
        PathApi.equals(anchorBlockPath, focusBlockPath);

      if (options.block && !sameBlock) return false;
      if (options.blocks && sameBlock) return false;

      const target =
        (options.block || options.start || options.end) && anchorBlockPath
          ? anchorBlockPath
          : selection;

      if (options.match) {
        const match = normalizeMatch(options.match);
        const matched = editor.read((state) =>
          state.nodes.above({
            at: selection.anchor,
            match: (node: Node, path: Path) =>
              typeof match === 'function'
                ? (match as (node: Node, path: Path) => boolean)(node, path)
                : true,
          } as never)
        );

        if (!matched) {
          return false;
        }
      }

      if (
        options.start &&
        !editor.read((state) =>
          state.points.isStart(RangeApi.start(selection), target as Location)
        )
      ) {
        return false;
      }

      if (
        options.end &&
        !editor.read((state) =>
          state.points.isEnd(RangeApi.end(selection), target as Location)
        )
      ) {
        return false;
      }

      return true;
    },
    isInline,
    isElementStateEmpty: (element: unknown) =>
      ElementApi.isElement(element) &&
      Object.keys(NodeApi.extractProps(element)).every((key) => key === 'type'),
    isEmpty: (
      at?: Location | unknown,
      options: Record<string, unknown> = {}
    ) => {
      if (ElementApi.isElement(at)) {
        return editor.read((state) => state.nodes.isEmpty(at));
      }

      const location =
        (at as Location | undefined) ??
        editor.read((state) => state.selection.get()) ??
        [];

      if (options.block) {
        const block = (
          plateApi.block as (options: Record<string, unknown>) => unknown
        )({
          at: location,
        }) as [unknown, Location] | undefined;

        return (
          !block ||
          editor.read((state) => state.nodes.isEmpty(block[0] as never))
        );
      }

      return editor.read((state) => state.text.string(location).length === 0);
    },
    isEnd: (point: Point, at: Location) =>
      editor.read((state) => state.points.isEnd(point, at)),
    isExpanded: () =>
      editor.read((state) => {
        const selection = state.selection.get();

        return !!selection && RangeApi.isExpanded(selection);
      }),
    isComposing: () => editor.dom?.composing === true,
    isFocused: () =>
      editor.read((state: any) => state.dom?.focused?.() ?? false) ||
      (editor.dom as { focused?: boolean } | undefined)?.focused === true,
    isSelectable: (element: unknown) =>
      !ElementApi.isElement(element) ||
      (getElementPlugin(element)?.node.isSelectable !== false &&
        editor.read((state) => state.schema.isSelectable(element))),
    isStart: (point: Point, at: Location) =>
      editor.read((state) => state.points.isStart(point, at)),
    isVoid: (element: unknown) =>
      ElementApi.isElement(element) &&
      (getElementPlugin(element)?.node.isVoid === true ||
        editor.read((state) => state.schema.isVoid(element))),
    markableVoid: (element: unknown) =>
      ElementApi.isElement(element) &&
      (getElementPlugin(element)?.node.isMarkableVoid === true ||
        editor.read((state) => state.schema.markableVoid(element))),
    hasPath: (path: unknown) =>
      Array.isArray(path) &&
      editor.read((state) => state.nodes.hasPath(path as never)),
    next: (options: Record<string, unknown> = {}) =>
      editor.read((state) =>
        state.nodes.next(normalizeBlockOptions(options) as never)
      ),
    node: (atOrOptions: any) =>
      editor.read((state) => {
        if (
          atOrOptions &&
          typeof atOrOptions === 'object' &&
          'id' in atOrOptions
        ) {
          return state.nodes.find({
            at: atOrOptions.at ?? [],
            match: (node: unknown) =>
              ElementApi.isElement(node) && node.id === atOrOptions.id,
            voids: true,
          });
        }

        if (
          atOrOptions &&
          typeof atOrOptions === 'object' &&
          !Array.isArray(atOrOptions) &&
          ('at' in atOrOptions || 'match' in atOrOptions)
        ) {
          const options = normalizeNodeOptions(atOrOptions);
          const at = options.at ?? [];

          if (Array.isArray(at)) {
            try {
              const entry = state.nodes.get(at as never);

              if (entry && matchesNodeOptions(entry[0], entry[1], options)) {
                return entry;
              }
            } catch {
              // Fall through to ancestor/query search below.
            }
          }

          try {
            const above = state.nodes.above(options as never);

            if (above) return above;
          } catch {
            // Fall through to find.
          }

          try {
            return state.nodes.find(options as never);
          } catch {
            return;
          }
        }

        try {
          return state.nodes.get(atOrOptions as never);
        } catch {
          return;
        }
      }),
    nodes: (options: Record<string, unknown> = {}) =>
      editor.read((state) =>
        state.nodes.entries(normalizeNodeOptions(options) as never)
      ),
    parent: (at: unknown) =>
      editor.read((state) => {
        try {
          return state.nodes.parent(at as never);
        } catch {
          return;
        }
      }),
    pathRef: (path: Location, options?: Record<string, unknown>) =>
      pathRef(editor, path as never, options as never),
    pathRefs: () => pathRefs(editor),
    onChange: () => {},
    range: (at: unknown, to?: unknown) =>
      editor.read((state) => {
        if (at === 'before' && to) {
          const point = RangeApi.isRange(to)
            ? RangeApi.start(to)
            : state.points.start(to as never);
          const before = state.points.before(point);

          return before ? { anchor: before, focus: point } : undefined;
        }

        return state.ranges.get(at as never, to as never);
      }),
    scrollIntoView: () => {},
    previous: (options: Record<string, unknown> = {}) =>
      editor.read((state) =>
        state.nodes.previous(normalizeBlockOptions(options) as never)
      ),
    some: (options: Record<string, unknown> = {}) =>
      editor.read((state) =>
        state.nodes.some(normalizeNodeOptions(options) as never)
      ),
    start: (at: unknown) =>
      editor.read((state) => state.points.start(at as never)),
    string: (at: unknown, options?: Record<string, unknown>) =>
      editor.read((state) => state.text.string(at as never, options)),
  });

  for (const property of Reflect.ownKeys(pliteApi)) {
    if (Reflect.has(plateApi, property)) continue;

    const descriptor = Reflect.getOwnPropertyDescriptor(pliteApi, property);

    if (descriptor) {
      Reflect.defineProperty(plateApi, property, {
        ...descriptor,
        configurable: true,
      });
    }
  }

  Object.defineProperty(editor, 'api', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: plateApi,
  });
};

const installPlateNormalizeRulesExtension = (editor: BasePlateEditor) => {
  const hasNormalizeRules = editor.meta.pluginList.some(
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
          const overridePlugin = editor.meta.pluginCache.rules.match
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
          const text = editor.read((state) => state.text.string(path as never));

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

const installPlateLengthExtension = (editor: BasePlateEditor) => {
  const plugin = editor.meta.pluginList.find(
    (candidate) => (candidate as { runtimeLength?: boolean }).runtimeLength
  );

  if (!plugin) return;

  editor.extend(
    defineEditorExtension({
      name: 'plate:length:plite',
      operations: {
        apply({ operation, next }) {
          next(operation);

          const maxLength = (
            editor.getOptions(plugin) as { maxLength?: number } | undefined
          )?.maxLength;

          if (!maxLength) return;

          const length = editor.read((state) => state.text.string([]).length);

          if (length <= maxLength) return;

          editor.update((tx) => {
            tx.text.delete({
              distance: length - maxLength,
              reverse: true,
              unit: 'character',
            });
          });
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
  editor: BasePlateEditor,
  path: number[],
  root?: string
) => {
  try {
    const rootValue = editor.read((state) =>
      state.value.root(root === 'main' ? undefined : (root as never))
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
  editor: BasePlateEditor,
  rule: string,
  node: Record<string, unknown>,
  path: number[]
) => {
  for (const key of editor.meta.pluginCache.rules.match) {
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
  editor: BasePlateEditor,
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

const createPlateElementSpec = (
  plugin: AnyEditorPlugin
): EditorElementSpec | null => {
  const { node } = plugin;
  const type = node?.type;

  if (!type) return null;

  const hasSchemaBehavior =
    node.isInline !== undefined ||
    node.isMarkableVoid !== undefined ||
    node.isSelectable !== undefined ||
    node.isVoid !== undefined;

  if (!hasSchemaBehavior) return null;

  const spec: EditorElementSpec = { type };

  if (node.isInline === true) {
    spec.inline = true;
  }
  if (node.isSelectable === false) {
    spec.selectable = false;
  }
  if (node.isMarkableVoid === true) {
    spec.markableVoid = true;
  }
  if (node.isVoid === true) {
    spec.void =
      node.isInline === true
        ? node.isMarkableVoid === true
          ? 'markable-inline'
          : 'inline'
        : 'block';
  }

  return spec;
};

const installPlateElementSpecsExtension = (editor: BasePlateEditor) => {
  const elements = editor.meta.pluginList.flatMap((plugin) => {
    const spec = createPlateElementSpec(plugin);

    return spec ? [spec] : [];
  });

  if (elements.length === 0) return;

  editor.extend(
    defineEditorExtension({
      elements,
      name: 'plate:element-specs:plite',
    })
  );
};

const installPlateMergeRulesExtension = (editor: BasePlateEditor) => {
  const hasMergeRules = editor.meta.pluginList.some(
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
            const nextPath = PathApi.next(operation.path);
            const nextNode = getRuntimeDescendant(
              editor,
              nextPath,
              (operation as { root?: string }).root
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
                  root: (operation as { root?: string }).root,
                  type: 'remove_node',
                } as never);
              }

              next({
                path: nextPath,
                position: 0,
                properties: getMergeNodeProperties(nextNode),
                root: (operation as { root?: string }).root,
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

export type BaseWithSlateOptions<P extends EditorPluginInput = CorePlugin> = {
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
   * Configure Plite's chunking optimization, which reduces latency while
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
   * Configuration for the built-in navigation feedback plugin.
   *
   * This core plugin flashes the landed target after navigation jumps such as
   * TOC, footnote, search, or custom outline movement.
   *
   * @default { duration: 1600 }
   */
  navigationFeedback?: NavigationFeedbackConfig['options'] | boolean;
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

export type WithSlateOptions<
  V extends Value = Value,
  P extends EditorPluginInput = CorePlugin,
> = BaseWithSlateOptions<P> &
  Pick<
    Partial<AnyEditorPlugin>,
    | 'api'
    | 'decorate'
    | 'extendEditor'
    | 'inject'
    | 'transformInitialValue'
    | 'normalizeInitialValue'
    | 'options'
    | 'override'
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
    value?:
      | ((editor: BasePlateEditor) => Promise<NoInfer<V>> | NoInfer<V>)
      | NoInfer<V>
      | string
      | null;
    /** Function to configure the root plugin */
    rootPlugin?: (plugin: AnyEditorPlugin) => AnyEditorPlugin;
    /**
     * Callback called when the editor is ready (after initialization
     * completes).
     */
    onReady?: (ctx: {
      editor: BasePlateEditor;
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
 * @see {@link createBasePlateEditor} for a higher-level non-React editor creation function.
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 * @see {@link withPlate} for the React-specific enhancement function.
 */
export const withPlite = <
  V extends Value = Value,
  P extends EditorPluginInput = CorePlugin,
>(
  e: Editor,
  {
    id,
    affinity = true,
    autoSelect,
    chunking = true,
    maxLength,
    navigationFeedback,
    nodeId,
    optionsStoreFactory,
    plugins = [],
    readOnly = false,
    rootPlugin,
    selection,
    shouldNormalizeEditor,
    skipInitialization,
    userId,
    value,
    onReady,
    ...pluginConfig
  }: WithSlateOptions<V, P> = {}
): TBasePlateEditor<V, InferPlugins<P[]>> => {
  const editor = e as unknown as BasePlateEditor;

  editor.meta = editor.meta ?? ({} as BasePlateEditor['meta']);
  editor.id = id ?? editor.id ?? nanoid();
  editor.meta.key = editor.meta.key ?? nanoid();
  editor.meta.isFallback = false;
  editor.meta.userId = userId;
  installPlateRuntimeApiFacade(editor);
  installCurrentRuntimeTransforms(editor);
  installPlateRuntimeStateMirrors(editor);
  editor.dom = {
    composing: false,
    currentKeyboardEvent: null,
    focused: false,
    prevSelection: null,
    readOnly,
  };

  editor.getPlugin = ((plugin) =>
    getEditorPluginInstance(editor, plugin)) as BasePlateEditor['getPlugin'];
  editor.getType = (pluginKey) => getPluginType(editor, pluginKey);
  editor.getInjectProps = (plugin) => {
    const nodeProps =
      editor.getPlugin<AnyEditorPlugin>(plugin).inject?.nodeProps ??
      ({} as any);

    nodeProps.nodeKey = nodeProps.nodeKey ?? editor.getType(plugin.key);
    nodeProps.styleKey = nodeProps.styleKey ?? nodeProps.nodeKey;

    return nodeProps;
  };
  editor.getOptionsStore = (plugin) =>
    getEditorPluginInstance(editor, plugin).optionsStore;
  editor.getOptions = (plugin) => {
    const store = editor.getOptionsStore(plugin);

    if (!store) return getEditorPluginInstance(editor, plugin).options;

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
  }) as BasePlateEditor['setOption'];
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
  }) as BasePlateEditor['setOptions'];

  // Plugin initialization code
  const pluginList = [...plugins];
  const corePlugins = getCorePlugins({
    affinity,
    chunking,
    maxLength,
    navigationFeedback,
    nodeId,
    plugins: pluginList,
  });

  let rootPluginInstance = createEditorPlugin({
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
  });

  // Apply rootPlugin configuration if provided
  if (rootPlugin) {
    rootPluginInstance = rootPlugin(rootPluginInstance) as any;
  }

  resolvePlugins(editor, [rootPluginInstance], optionsStoreFactory);
  installCurrentRuntimeInputRulesExtension(editor);
  installPlateElementSpecsExtension(editor);
  installPlateRuntimeTxExtensions(editor);
  installPlateLengthExtension(editor);
  installPlateMergeRulesExtension(editor);
  installPlateNormalizeRulesExtension(editor);

  /** Ignore normalizeNode overrides if shouldNormalizeNode returns false */
  const legacyTransforms = getCurrentRuntimeTransforms(editor) as unknown as {
    normalizeNode: (...args: any[]) => any;
  };
  const normalizeNode = legacyTransforms.normalizeNode;
  legacyTransforms.normalizeNode = (
    ...args: Parameters<typeof normalizeNode>
  ) => {
    if (!editor.api.shouldNormalizeNode(args[0] as never)) {
      return;
    }

    return normalizeNode(...args);
  };
  editor.normalizeNode =
    legacyTransforms.normalizeNode as BasePlateEditor['normalizeNode'];

  if (!skipInitialization) {
    initializeBasePlateEditor(editor, {
      autoSelect,
      selection,
      shouldNormalizeEditor,
      value,
      onReady: onReady as any,
    });
  }

  return editor as any;
};

export type CreateBasePlateEditorOptions<
  V extends Value = Value,
  P extends readonly EditorPluginInput[] = readonly CorePlugin[],
> = Omit<WithSlateOptions<V, InferPlugins<P>>, 'plugins'> & {
  /**
   * Initial editor to be extended with `withPlite`.
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

/**
 * Creates a Plite editor (non-React version).
 *
 * This function creates a fully configured Plate editor instance that can be
 * used in non-React environments or server-side contexts. It applies all the
 * specified plugins and configurations to create a functional editor.
 *
 * Examples:
 *
 * ```ts
 * const editor = createBasePlateEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   value: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom configuration
 * const editor = createBasePlateEditor({
 *   plugins: [ParagraphPlugin],
 *   maxLength: 1000,
 *   nodeId: { idCreator: () => uuidv4() },
 *   autoSelect: 'end',
 * });
 *
 * // Server-side editor
 * const editor = createBasePlateEditor({
 *   plugins: [ParagraphPlugin],
 *   value: '<p>HTML content</p>',
 *   skipInitialization: true,
 * });
 * ```
 *
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 * @see {@link withPlite} for the underlying function that applies Plite enhancements to an editor.
 */
export const createBasePlateEditor = <
  V extends Value = Value,
  const P extends readonly EditorPluginInput[] = readonly CorePlugin[],
>({
  editor = createCurrentRuntimeEditor(),
  ...options
}: CreateBasePlateEditorOptions<V, P> = {}) =>
  withPlite<V, InferPlugins<P>>(
    editor,
    options as WithSlateOptions<V, InferPlugins<P>>
  );
