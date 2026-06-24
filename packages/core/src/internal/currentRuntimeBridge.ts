import {
  createEditor,
  defineEditorExtension,
  NodeApi,
  PathApi,
  RangeApi,
  type BaseEditor,
  type Descendant,
  type DescendantIn,
  type Element,
  type Editor,
  type EditorMarks,
  type EditorTransformApi,
  type Location,
  type NodeEntry,
  type Operation,
  type Path,
  type Point,
  type Range as PliteRange,
  type Selection,
  type TextInsertTextOptions,
  type Value,
} from '@platejs/plite';
import { getEditorTransformRegistry } from '@platejs/plite/internal';
import { history } from '@platejs/plite-history';

import { pipeOnNodeChange } from '../lib/utils/pipeOnNodeChange';
import { pipeOnTextChange } from '../lib/utils/pipeOnTextChange';
import {
  getStoredCurrentRuntimeTransforms,
  setStoredCurrentRuntimeTransforms,
} from './currentRuntimeTransformStore';
import type { BasePlateEditor } from '../lib/editor/BasePlateEditor';
import type { InsertTextInputRuleContext } from '../lib/plugins/input-rules/types';
import merge from 'lodash/merge.js';

export type CurrentRuntimeDescendantIn<TValue extends Value> =
  DescendantIn<TValue>;
export type CurrentRuntimeEditor<TValue extends Value = Value> = Editor<TValue>;

type CurrentRuntimeQueryMatch<TNode extends Descendant> =
  | Partial<Record<keyof TNode | string, unknown>>
  | ((node: TNode, path: Path) => boolean);

type CurrentRuntimeNodeQueryOptions<TNode extends Descendant> = {
  at?: Descendant | Location;
  block?: boolean;
  empty?: boolean;
  from?: 'after' | 'child' | 'parent';
  id?: boolean | string;
  match?: CurrentRuntimeQueryMatch<TNode>;
  mode?: 'all' | 'highest' | 'lowest';
  reverse?: boolean;
  text?: boolean;
  voids?: boolean;
  [key: string]: unknown;
};

type CurrentRuntimeIsAtOptions<TNode extends Descendant = Descendant> =
  CurrentRuntimeNodeQueryOptions<TNode> & {
    blocks?: boolean;
    end?: boolean;
    start?: boolean;
  };

export type CurrentRuntimeEditorApi<_TValue extends Value = Value> = Record<
  string,
  any
> & {
  above: <TNode extends Element = Element>(
    options?: CurrentRuntimeNodeQueryOptions<TNode>
  ) => NodeEntry<TNode> | undefined;
  after: (at: Location, options?: Record<string, unknown>) => Point | undefined;
  before: (
    at: Location,
    options?: Record<string, unknown>
  ) => Point | undefined;
  block: <TNode extends Element = Element>(
    options?: CurrentRuntimeNodeQueryOptions<TNode>
  ) => NodeEntry<TNode> | undefined;
  blocks: <TNode extends Element = Element>(
    options?: CurrentRuntimeNodeQueryOptions<TNode>
  ) => NodeEntry<TNode>[];
  edges: (at: Location) => [Point, Point] | undefined;
  end: (at: Location) => Point;
  fragment: (
    at?: Location | null,
    options?: Record<string, unknown>
  ) => Descendant[];
  history: {
    isMerging: () => boolean | undefined;
    isSaving: () => boolean | undefined;
    withMerging: (fn: () => void) => void;
    withNewBatch: (fn: () => void) => void;
    withoutMerging: (fn: () => void) => void;
    withoutSaving: (fn: () => void) => void;
  };
  dom: {
    blur: () => void;
    deselect: () => void;
    focus: (options?: { retries?: number }) => void;
    resolveDOMNode: (node: unknown) => HTMLElement | null;
    resolveDOMRange: (range: unknown) => globalThis.Range | null;
    resolvePath: (node: unknown) => number[];
    resolvePliteNode: (domNode: globalThis.Node) => unknown;
  };
  clipboard: {
    insertData: (data: DataTransfer) => boolean;
    writeSelection: (data: Pick<DataTransfer, 'getData' | 'setData'>) => void;
  };
  isBlock: (node: unknown) => boolean;
  isCollapsed: () => boolean;
  isAt: <TNode extends Descendant = Descendant>(
    options?: CurrentRuntimeIsAtOptions<TNode>
  ) => boolean;
  isEmpty: (
    at?: Descendant | Location,
    options?: Record<string, unknown>
  ) => boolean;
  isExpanded: () => boolean;
  isInline: (element: unknown) => boolean;
  isSelectable: (element: unknown) => boolean;
  isVoid: (element: unknown) => boolean;
  node: <TNode extends Descendant = Descendant>(
    atOrOptions?: Descendant | Location | CurrentRuntimeNodeQueryOptions<TNode>
  ) => NodeEntry<TNode> | undefined;
  nodes: <TNode extends Descendant = Descendant>(
    options?: CurrentRuntimeNodeQueryOptions<TNode>
  ) => Generator<NodeEntry<TNode>, void, undefined>;
  parent: <TNode extends Element = Element>(
    at: Location
  ) => NodeEntry<TNode> | undefined;
  range: (
    edgeOrAt: 'after' | 'before' | Location,
    at?: Location
  ) => PliteRange | undefined;
};
export type CurrentRuntimeEditorBase<TValue extends Value = Value> =
  BaseEditor<TValue> & {
    children: TValue;
    history: unknown;
    id: string;
    marks: EditorMarks<TValue> | null;
    meta: Record<string, any>;
    normalizeNode: (...args: any[]) => void;
    operations: Operation<TValue>[];
    redo: () => void;
    selection: Selection;
    undo: () => void;
  };
export type CurrentRuntimeEditorTransforms<TValue extends Value = Value> =
  EditorTransformApi<TValue> & Record<string, any>;
export type CurrentRuntimeOperation<_TNode extends Descendant = Descendant> =
  Operation;

const currentRuntimeInputRuleExtensions = new WeakSet<object>();

const createCachedGetter = <T>(fn: () => T) => {
  let hasValue = false;
  let value: T;

  return () => {
    if (!hasValue) {
      value = fn();
      hasValue = true;
    }

    return value;
  };
};

const isInputRuleTriggerMatch = (
  trigger: readonly string[] | string,
  text: string
) => (Array.isArray(trigger) ? trigger.includes(text) : trigger === text);

const executeCurrentRuntimeInsertTextInputRules = (
  editor: BasePlateEditor,
  text: string,
  options: TextInsertTextOptions | undefined,
  insertText: (
    text: string,
    options?: TextInsertTextOptions & { marks?: boolean }
  ) => void
) => {
  const rules = editor.meta.inputRules?.insertText?.byTrigger?.[text] ?? [];

  if (rules.length === 0) return false;

  const selection = editor.read((state) => state.selection.get());
  const isCollapsed = !!selection && RangeApi.isCollapsed(selection);
  const getBlockEntry = createCachedGetter(() => editor.api.block());
  const getBlockStartRange = createCachedGetter(() => {
    const blockEntry = getBlockEntry();

    if (!selection || !blockEntry) return;

    return {
      anchor: editor.api.start(blockEntry[1]),
      focus: RangeApi.start(selection),
    };
  });
  const getBlockStartText = createCachedGetter(() => {
    const range = getBlockStartRange();

    return range ? editor.api.string(range) : undefined;
  });
  const getCharAfter = createCachedGetter(() => {
    if (!selection || !isCollapsed) return;

    const afterPoint = editor.api.after(selection, {
      distance: 1,
      unit: 'character',
    });

    return afterPoint
      ? editor.api.string({ anchor: selection.anchor, focus: afterPoint }) ||
          undefined
      : undefined;
  });
  const getCharBefore = createCachedGetter(() => {
    if (!selection || !isCollapsed) return;

    const beforePoint = editor.api.before(selection, {
      distance: 1,
      unit: 'character',
    });

    return beforePoint
      ? editor.api.string({ anchor: beforePoint, focus: selection.anchor }) ||
          undefined
      : undefined;
  });

  for (const rule of rules) {
    if (!isInputRuleTriggerMatch(rule.trigger, text)) continue;

    const context: InsertTextInputRuleContext = {
      cause: 'insertText',
      editor,
      getBlockEntry,
      getBlockStartRange,
      getBlockStartText,
      getBlockTextBeforeSelection: () => getBlockStartText() ?? '',
      getCharAfter,
      getCharBefore,
      insertText,
      isCollapsed,
      options,
      pluginKey: rule.pluginKey,
      text,
    };

    if (rule.enabled?.(context) === false) continue;

    const match = rule.resolve ? rule.resolve(context) : true;

    if (match === undefined) continue;
    if (rule.apply(context, match) !== false) return true;
  }

  return false;
};

export const getCurrentRuntimeTransforms = <TValue extends Value = Value>(
  editor: unknown
) => {
  const stored =
    getStoredCurrentRuntimeTransforms<CurrentRuntimeEditorTransforms<TValue>>(
      editor
    );

  if (stored) {
    return stored;
  }

  return getEditorTransformRegistry(
    editor as CurrentRuntimeEditor<TValue>
  ) as CurrentRuntimeEditorTransforms<TValue>;
};

export const installCurrentRuntimeTransforms = <TValue extends Value = Value>(
  editor: unknown
) => {
  const existing =
    getStoredCurrentRuntimeTransforms<CurrentRuntimeEditorTransforms<TValue>>(
      editor
    );
  const registry = getEditorTransformRegistry(
    editor as CurrentRuntimeEditor<TValue>
  ) as CurrentRuntimeEditorTransforms<TValue>;
  const runtimeEditor = editor as CurrentRuntimeEditor<TValue>;
  const runUpdate = (fn: (tx: Record<string, any>) => void) => {
    runtimeEditor.update(fn as never);
  };
  const plateEditor = runtimeEditor as CurrentRuntimeEditor<TValue> &
    Record<string, any>;
  const getPluginOptions = (key: string) =>
    plateEditor.getOptions?.({ key }) ??
    plateEditor.plugins?.[key]?.options ??
    {};
  const getSelection = () =>
    runtimeEditor.read((state) => state.selection.get());
  const getNode = (path: number[]) => {
    try {
      return runtimeEditor.read(
        (state) => state.nodes.get(path as never)?.[0]
      ) as Descendant | undefined;
    } catch {
      return;
    }
  };
  const getParentNode = (path: number[]) =>
    path.length > 0 ? getNode(path.slice(0, -1)) : undefined;
  const getText = (path: number[]) => {
    const node = getNode(path);

    return node && 'text' in node && typeof node.text === 'string'
      ? node.text
      : undefined;
  };
  const getPointOutsideRemovedPath = (path: number[]) => {
    try {
      return runtimeEditor.read((state) => {
        const target = path as never;

        return (
          state.points.after(target) ??
          state.points.before(target) ??
          state.points.start([])
        );
      });
    } catch {
      return null;
    }
  };
  const pointIsInsidePath = (
    point: { path: number[] } | null | undefined,
    path: number[]
  ) =>
    !!point &&
    (PathApi.equals(path, point.path) || PathApi.isAncestor(path, point.path));
  const resolveTextPoint = (point: { offset: number; path: number[] }) => {
    const node = getNode(point.path);

    if (node && NodeApi.isText(node)) return point;

    try {
      return runtimeEditor.read((state) =>
        state.points.start(point.path as never)
      );
    } catch {
      return point;
    }
  };
  const hasOptionListener = (key: string) => {
    const listener = plateEditor.getOption?.({ key: 'pliteExtension' }, key);

    return typeof listener === 'function' && !listener.name.startsWith('NOOP_');
  };
  const notifyNodeChange = (
    node: Descendant | undefined,
    prevNode: Descendant | undefined,
    operation: Record<string, unknown>
  ) => {
    if (!node || !prevNode) return;
    if (
      plateEditor.meta?.pluginCache?.handlers?.onNodeChange.length === 0 &&
      !hasOptionListener('onNodeChange')
    ) {
      return;
    }

    const handled = pipeOnNodeChange(
      plateEditor as never,
      node,
      prevNode,
      operation as never
    );

    if (handled) return;

    plateEditor.getOption?.(
      { key: 'pliteExtension' },
      'onNodeChange'
    )?.({
      editor: plateEditor,
      node,
      operation,
      prevNode,
    });
  };
  const notifyTextChange = (
    path: number[],
    prevText: string | undefined,
    operation: Record<string, unknown>
  ) => {
    if (prevText === undefined) return;
    if (
      plateEditor.meta?.pluginCache?.handlers?.onTextChange.length === 0 &&
      !hasOptionListener('onTextChange')
    ) {
      return;
    }

    const text = getText(path);
    const node = getParentNode(path);

    if (text === undefined || !node) return;

    const handled = pipeOnTextChange(
      plateEditor as never,
      node,
      text,
      prevText,
      operation as never
    );

    if (handled) return;

    plateEditor.getOption?.(
      { key: 'pliteExtension' },
      'onTextChange'
    )?.({
      editor: plateEditor,
      node,
      operation,
      prevText,
      text,
    });
  };
  const createRemoveTextOperation = (
    path: number[],
    prevText: string,
    text: string
  ) => {
    let offset = 0;

    while (
      offset < prevText.length &&
      offset < text.length &&
      prevText[offset] === text[offset]
    ) {
      offset += 1;
    }

    return {
      offset,
      path,
      text: prevText.slice(offset, prevText.length - (text.length - offset)),
      type: 'remove_text',
    };
  };
  const normalizeNodeIdsForInsert = (node: unknown): unknown => {
    const options = getPluginOptions('nodeId') as {
      filterText?: boolean;
      idCreator?: () => unknown;
      idKey?: string;
    };
    const { filterText = true, idCreator, idKey = 'id' } = options;

    if (!idCreator) return node;

    const normalize = (nextNode: unknown): unknown => {
      if (!nextNode || typeof nextNode !== 'object') return nextNode;

      const record = nextNode as Record<string, unknown>;
      const children = Array.isArray(record.children)
        ? record.children.map(normalize)
        : undefined;
      const shouldAssign =
        (!filterText || typeof record.type !== 'undefined') &&
        record[idKey] === undefined &&
        NodeApi.isNode(record as never);

      if (!shouldAssign && children === record.children) return nextNode;

      return {
        ...record,
        ...(children ? { children } : {}),
        ...(shouldAssign ? { [idKey]: idCreator() } : {}),
      };
    };

    return Array.isArray(node) ? node.map(normalize) : normalize(node);
  };
  const rememberSelectionChange = () => {
    if (!plateEditor.dom) return;

    plateEditor.dom.prevSelection = structuredClone(getSelection());
    plateEditor.dom.currentKeyboardEvent = null;
  };
  const maybeScrollOperation = (
    operationType: string,
    target: { offset: number; path: number[] } | null
  ) => {
    const api = plateEditor.api as Record<string, any> | undefined;

    if (!target || api?.isScrolling?.() !== true) return;

    const {
      scrollMode,
      scrollOperations = {},
      scrollOptions,
    } = getPluginOptions('dom') as {
      scrollMode?: 'first' | 'last';
      scrollOperations?: Record<string, boolean | undefined>;
      scrollOptions?: unknown;
    };

    if (scrollOperations[operationType] === false) return;

    api?.scrollIntoView?.(target, {
      ...(typeof scrollOptions === 'object' && scrollOptions
        ? scrollOptions
        : {}),
      scrollMode: scrollMode === 'first' ? 'if-needed' : 'if-needed',
    });
  };
  const enforceMaxLength = () => {
    const { maxLength } = getPluginOptions('length') as {
      maxLength?: number;
    };

    if (!maxLength) return;

    const length = runtimeEditor.read((state) => state.text.string([]).length);

    if (length <= maxLength) return;

    runUpdate((tx) =>
      tx.text.delete({
        distance: length - maxLength,
        reverse: true,
        unit: 'character',
      })
    );
  };
  const transforms = existing ?? {
    ...registry,
    ...({
      addMark: (key: string, value: unknown) => {
        runUpdate((tx) => tx.marks.add(key, value));
      },
      collapse: (options?: unknown) => {
        runUpdate((tx) => tx.selection.collapse(options));
      },
      delete: (options?: unknown) => {
        const selection = getSelection();
        const path = selection?.focus.path;
        const prevText = path ? getText(path) : undefined;

        runUpdate((tx) => tx.text.delete(options));

        if (path && prevText !== undefined) {
          notifyTextChange(
            path,
            prevText,
            createRemoveTextOperation(path, prevText, getText(path) ?? '')
          );
        }
      },
      deleteBackward: (unitOrOptions?: unknown) => {
        const selection = getSelection();
        const path = selection?.focus.path;
        const prevText = path ? getText(path) : undefined;

        runUpdate((tx) =>
          tx.text.deleteBackward(
            typeof unitOrOptions === 'string'
              ? { unit: unitOrOptions }
              : (unitOrOptions ?? {})
          )
        );

        if (path && prevText !== undefined) {
          notifyTextChange(
            path,
            prevText,
            createRemoveTextOperation(path, prevText, getText(path) ?? '')
          );
        }
      },
      deleteForward: (unitOrOptions?: unknown) => {
        const selection = getSelection();
        const path = selection?.focus.path;
        const prevText = path ? getText(path) : undefined;

        runUpdate((tx) =>
          tx.text.deleteForward(
            typeof unitOrOptions === 'string'
              ? { unit: unitOrOptions }
              : (unitOrOptions ?? {})
          )
        );

        if (path && prevText !== undefined) {
          notifyTextChange(
            path,
            prevText,
            createRemoveTextOperation(path, prevText, getText(path) ?? '')
          );
        }
      },
      deleteFragment: (options?: unknown) => {
        runUpdate((tx) => tx.fragment.delete(options));
      },
      deselect: () => {
        rememberSelectionChange();
        runUpdate((tx) => tx.selection.clear());
      },
      blur: () => {
        const domApi = (runtimeEditor.api as CurrentRuntimeEditorApi<TValue>)
          .dom;

        domApi?.blur?.();
      },
      focus: (options?: {
        edge?: 'endEditor' | 'startEditor';
        retries?: number;
      }) => {
        if (options?.edge) {
          const point = runtimeEditor.read((state) =>
            options.edge === 'startEditor'
              ? state.points.start([])
              : state.points.end([])
          );

          runUpdate((tx) => {
            tx.selection.set({ anchor: point, focus: point });
          });
        }

        const domApi = (runtimeEditor.api as CurrentRuntimeEditorApi<TValue>)
          .dom;

        domApi?.focus?.({ retries: options?.retries });
      },
      insertBreak: () => {
        const selection = getSelection();
        const api = plateEditor.api as
          | {
              block?: () => unknown;
              isAt?: (options: unknown) => boolean;
              isCollapsed?: () => boolean;
            }
          | undefined;
        const block = api?.block?.();

        if (
          selection &&
          block &&
          api?.isCollapsed?.() &&
          api?.isAt?.({ start: true })
        ) {
          const [blockNode, blockPath] = block as [
            Descendant & { children?: unknown },
            number[],
          ];
          const idKey =
            (getPluginOptions('nodeId') as { idKey?: string }).idKey ?? 'id';
          const props = NodeApi.extractProps(blockNode) as Record<
            string,
            unknown
          >;
          const nextPath = PathApi.next(blockPath);

          delete props[idKey];

          runUpdate((tx) => {
            tx.nodes.insert(
              {
                ...props,
                children: [{ text: '' }],
              },
              { at: blockPath }
            );
            tx.selection.set({
              anchor: { offset: 0, path: [...nextPath, 0] },
              focus: { offset: 0, path: [...nextPath, 0] },
            });
          });
          return;
        }

        runUpdate((tx) => tx.break.insert());
      },
      insertData: (data: DataTransfer) => {
        const clipboard = (runtimeEditor.api as CurrentRuntimeEditorApi<TValue>)
          .clipboard;
        let handled = false;

        runUpdate(() => {
          handled = clipboard?.insertData?.(data) ?? false;
        });

        return handled;
      },
      insertFragment: (fragment: unknown, options?: unknown) => {
        runUpdate((tx) => tx.fragment.insert(fragment, options));
        enforceMaxLength();
      },
      insertNode: (node: unknown, options?: unknown) => {
        const nextNode = normalizeNodeIdsForInsert(node);

        runUpdate((tx) => tx.nodes.insert(nextNode, options));
        notifyNodeChange(nextNode as Descendant, nextNode as Descendant, {
          node: nextNode,
          path: (options as { at?: number[] } | undefined)?.at ?? [],
          type: 'insert_node',
        });
      },
      insertNodes: (nodes: unknown, options?: unknown) => {
        const nextNodes = normalizeNodeIdsForInsert(nodes);

        runUpdate((tx) => tx.nodes.insert(nextNodes, options));
        (Array.isArray(nextNodes) ? nextNodes : [nextNodes]).forEach(
          (nextNode, index) => {
            notifyNodeChange(nextNode as Descendant, nextNode as Descendant, {
              node: nextNode,
              path: [
                ...((options as { at?: number[] } | undefined)?.at ?? []),
                index,
              ],
              type: 'insert_node',
            });
          }
        );
      },
      insertSoftBreak: () => {
        runUpdate((tx) => tx.text.insert('\n'));
      },
      insertText: (text: string, options?: unknown) => {
        const selection = getSelection();
        const target = selection ? structuredClone(selection.focus) : null;
        const path = selection?.focus.path;
        const prevText = path ? getText(path) : undefined;

        runUpdate((tx) => tx.text.insert(text, options));
        enforceMaxLength();
        maybeScrollOperation('insert_text', target);

        if (path && prevText !== undefined) {
          notifyTextChange(path, prevText, {
            offset: selection?.focus.offset ?? 0,
            path,
            text,
            type: 'insert_text',
          });
        }
      },
      liftNodes: (options?: unknown) => {
        runUpdate((tx) => tx.nodes.lift(options));
      },
      mergeNodes: (options?: unknown) => {
        runUpdate((tx) => tx.nodes.merge(options));
      },
      move: (options?: unknown) => {
        rememberSelectionChange();
        runUpdate((tx) => tx.selection.move(options));
      },
      moveNodes: (options?: unknown) => {
        runUpdate((tx) => tx.nodes.move(options));
      },
      normalize: (options?: unknown) => {
        const selection = getSelection();
        const normalizedSelection = selection
          ? {
              anchor: resolveTextPoint(selection.anchor),
              focus: resolveTextPoint(selection.focus),
            }
          : null;

        runUpdate((tx) => {
          if (
            normalizedSelection &&
            (!PathApi.equals(
              selection!.anchor.path,
              normalizedSelection.anchor.path
            ) ||
              !PathApi.equals(
                selection!.focus.path,
                normalizedSelection.focus.path
              ))
          ) {
            tx.selection.set(normalizedSelection);
          }

          tx.normalize(options);
        });
      },
      removeMark: (key: string) => {
        runUpdate((tx) => tx.marks.remove(key));
      },
      removeMarks: (keys?: string | string[]) => {
        if (keys === undefined) {
          runUpdate((tx) => {
            tx.marks.set({});
          });
          return;
        }

        const markKeys = Array.isArray(keys) ? keys : [keys];
        const selection = getSelection();

        if (selection && RangeApi.isCollapsed(selection)) {
          const leaf = getNode(selection.anchor.path);
          const nextMarks =
            leaf && NodeApi.isText(leaf)
              ? (NodeApi.extractProps(leaf) as Record<string, unknown>)
              : {};

          markKeys.forEach((key) => {
            delete nextMarks[key];
          });

          runUpdate((tx) => {
            tx.marks.set(nextMarks);
          });
          return;
        }

        runUpdate((tx) => {
          markKeys.forEach((key) => {
            tx.marks.remove(key);
          });
        });
      },
      removeNodes: (options?: unknown) => {
        const at =
          (options as { at?: number[] } | undefined)?.at ??
          getSelection()?.anchor.path.slice(0, -1) ??
          [];
        const selection = getSelection();
        const prevNode = getNode(at);
        const nextSelection =
          pointIsInsidePath(selection?.anchor, at) ||
          pointIsInsidePath(selection?.focus, at)
            ? getPointOutsideRemovedPath(at)
            : null;

        runUpdate((tx) => {
          if (nextSelection) {
            tx.selection.set({ anchor: nextSelection, focus: nextSelection });
          }

          tx.nodes.remove(options);
        });
        notifyNodeChange(prevNode, prevNode, {
          node: prevNode,
          path: at,
          type: 'remove_node',
        });
      },
      replaceNodes: (nodes: unknown, options?: { at?: unknown }) => {
        if (Array.isArray(options?.at) && options.at.length === 0) {
          runUpdate((tx) => tx.value.replace({ children: nodes }));
          return;
        }

        runUpdate((tx) => {
          tx.nodes.remove(options);
          tx.nodes.insert(nodes, options);
        });
      },
      reset: (options?: { children?: boolean; select?: boolean }) => {
        const children = [
          {
            children: [{ text: '' }],
            type: 'p',
          },
        ];

        runUpdate((tx) => {
          const selection = options?.select
            ? {
                anchor: { offset: 0, path: [0, 0] },
                focus: { offset: 0, path: [0, 0] },
              }
            : null;

          tx.value.replace({ children, selection });
        });
      },
      select: (target: unknown) => {
        rememberSelectionChange();
        runUpdate((tx) => tx.selection.set(target));
      },
      setFragmentData: (data: Pick<DataTransfer, 'getData' | 'setData'>) => {
        const clipboard = (runtimeEditor.api as CurrentRuntimeEditorApi<TValue>)
          .clipboard;

        clipboard?.writeSelection?.(data);
      },
      setNodes: (props: unknown, options?: unknown) => {
        const at =
          (options as { at?: number[] } | undefined)?.at ??
          getSelection()?.anchor.path.slice(0, -1) ??
          [];
        const prevNode = getNode(at);

        runUpdate((tx) => tx.nodes.set(props, options));
        notifyNodeChange(getNode(at), prevNode, {
          newProperties: props,
          path: at,
          properties: prevNode,
          type: 'set_node',
        });
      },
      setPoint: (props: unknown, options?: unknown) => {
        runUpdate((tx) => tx.selection.setPoint(props, options));
      },
      setSelection: (props: unknown) => {
        rememberSelectionChange();
        runUpdate((tx) => tx.selection.setRange(props));
      },
      splitNodes: (options?: unknown) => {
        runUpdate((tx) => tx.nodes.split(options));
      },
      toggleMark: (key: string, value?: unknown) => {
        runUpdate((tx) => tx.marks.toggle(key, value));
      },
      unsetNodes: (props: unknown, options?: unknown) => {
        runUpdate((tx) => tx.nodes.unset(props, options));
      },
      unwrapNodes: (options?: unknown) => {
        runUpdate((tx) => tx.nodes.unwrap(options));
      },
      withoutNormalizing: (fn: () => void) => {
        runUpdate((tx) => tx.withoutNormalizing(fn));
      },
      wrapNodes: (element: unknown, options?: unknown) => {
        runUpdate((tx) => tx.nodes.wrap(element, options));
      },
    } as Partial<CurrentRuntimeEditorTransforms<TValue>>),
  };

  setStoredCurrentRuntimeTransforms(editor, transforms);
};

export const assignCurrentRuntimeApi = <TValue extends Value = Value>(
  editor: unknown,
  api: Partial<CurrentRuntimeEditorApi<TValue>>
) => {
  merge((editor as { api: object }).api, api);
};
export const assignCurrentRuntimeTransforms = <TValue extends Value = Value>(
  editor: unknown,
  transforms: Partial<CurrentRuntimeEditorTransforms<TValue>>
) => {
  const current = getCurrentRuntimeTransforms<TValue>(editor);

  if (Object.isExtensible(current)) {
    merge(current, transforms);
    return;
  }

  setStoredCurrentRuntimeTransforms(editor, merge({}, current, transforms));
};
export const installCurrentRuntimeInputRulesExtension = (editor: unknown) => {
  if (currentRuntimeInputRuleExtensions.has(editor as object)) return;

  const runtimeEditor = editor as CurrentRuntimeEditor<Value> & {
    extend: (extension: unknown) => void;
  };

  runtimeEditor.extend(
    defineEditorExtension({
      name: 'plate:input-rules:plite',
      transforms: {
        insertText({ next, options, text }) {
          if (
            executeCurrentRuntimeInsertTextInputRules(
              runtimeEditor as unknown as BasePlateEditor,
              text,
              options,
              (nextText, nextOptions) => {
                next({ options: nextOptions, text: nextText });
              }
            )
          ) {
            return true;
          }

          return next();
        },
      },
    })
  );

  currentRuntimeInputRuleExtensions.add(editor as object);
};
export const createCurrentRuntimeEditor = createEditor;
export const syncCurrentRuntimeMethods = (_editor: unknown) => {};
export const withCurrentRuntimeHistory = <TValue extends Value = Value>(
  editor: CurrentRuntimeEditor<TValue>
) => {
  if (!('history' in editor.api)) {
    editor.extend(history());
  }

  return editor;
};
