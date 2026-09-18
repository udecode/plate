import type { ChatRequestOptions, ChatStatus, UIMessage } from 'ai';
import cloneDeep from 'lodash/cloneDeep.js';

import {
  BaseParagraphPlugin,
  ContentSlice,
  type Anchor,
  type DefinitionOf,
  type Descendant,
  type EditorNodesOptions,
  type EditorUpdateTransaction,
  type Element,
  ElementApi,
  type NamedRootKey,
  type Node,
  NodeApi,
  type NodeEntry,
  type NodeKey,
  PLUGINS,
  type Path,
  PathApi,
  type PluginReadState,
  PointApi,
  type Range,
  RangeApi,
  SelectionApi,
  TextApi,
  type Value,
  createEditorView,
  defineEffect,
  editorCommands,
  HistoryPlugin,
} from '../../core';
import type { TriggerComboboxPluginState } from '../../features/combobox';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../../features/table';
import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import { MarkdownPlugin } from '../../markdown';
import { type Editor, definePlugin } from '../../react/core';
import type {
  AIChatRequestContext,
  AIToolName,
} from '../lib/AIChatRequestContext';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';

export type AIMode = 'chat' | 'insert';

type TComment = {
  blockRef: string;
  comment: string;
  content: string;
};

export type AIChatAdapter = {
  clear: () => void;
  error?: Error;
  messages: UIMessage[];
  regenerate: (options?: ChatRequestOptions) => Promise<void>;
  sendMessage: (text: string, options?: ChatRequestOptions) => Promise<void>;
  status: ChatStatus;
  stop: () => Promise<void> | void;
};

export type EditorPromptParams = {
  editor: Editor;
  /** Whether the current selection contains exact selected nodes. */
  isNodeSelecting: boolean;
  /** Whether the representative selection range is expanded. */
  isSelecting: boolean;
};

export type EditorPrompt =
  | ((params: EditorPromptParams) => string)
  | {
      default: string;
      nodeSelecting?: string;
      selecting?: string;
    }
  | string;

export type TableCellUpdate = {
  content: string;
  ref: string;
};

export type AIChatNodeSnapshot = {
  isSelectionAnchor?: true;
  isSelectionFocus?: true;
  node: Element;
  nodeKey: NodeKey;
  root?: NamedRootKey;
};

export type AIChatPluginState = {
  _blockKey: NodeKey | null;
  _blockRefs: Record<string, Readonly<{ key: NodeKey; root?: NamedRootKey }>>;
  _requestId: string | null;
  _tableCellRefs: Record<
    string,
    Readonly<{ key: NodeKey; root?: NamedRootKey }>
  >;
  chat: AIChatAdapter | null;
  chatNodes: AIChatNodeSnapshot[];
  chatSelection: Range | null;
  mode: AIMode;
  open: boolean;
  previewValue: Value;
  streaming: boolean;
  toolName: AIToolName;
  trigger: NonNullable<TriggerComboboxPluginState['trigger']>;
  triggerPreviousCharPattern: NonNullable<
    TriggerComboboxPluginState['triggerPreviousCharPattern']
  >;
} & TriggerComboboxPluginState;

type MarkdownType = 'block' | 'editor' | 'nodeSelection' | 'tableCellWithRef';

const aiChatShowEffect = defineEffect<Range>({ key: 'ai.chat.show' });
const aiChatCommandEditors = new WeakMap<object, Editor>();
export const getAIChatCommandEditor = (editor: Editor) =>
  aiChatCommandEditors.get(editor) ?? editor;
const plateDependencies = [BaseAIPlugin, MarkdownPlugin] as const;
const dependencies = [...plateDependencies, HistoryPlugin] as const;

type AIChatPluginReadState = PluginReadState<
  DefinitionOf<(typeof plateDependencies)[number]>
>;
type AIChatInsertState = Pick<AIChatPluginReadState, 'nodes' | 'selection'>;
type AIChatPromptState = Pick<AIChatPluginReadState, 'selection'>;
type AIActionEditor = Editor<Value, readonly [typeof HistoryPlugin]>;
type AIActionTransaction = EditorUpdateTransaction<
  Value,
  readonly [typeof HistoryPlugin]
>;

const initialState: AIChatPluginState = {
  _blockKey: null,
  _blockRefs: {},

  _requestId: null,

  _tableCellRefs: {},
  chat: null,
  chatNodes: [],
  chatSelection: null,
  createComboboxInput: null,
  mode: 'insert',
  open: false,
  previewValue: [],
  streaming: false,
  toolName: null,
  trigger: ' ',
  triggerQuery: null,
  triggerPreviousCharPattern: /^\s?$/,
};

export const AIChatPlugin = definePlugin(PLUGINS.aiChat, {
  dependencies,
  initialState,
}).extend((context) => {
  const { editor } = context;
  let previewAnchor: Anchor<Range> | null = null;
  const tableDraft = new Map<
    NodeKey,
    { children: Value; root?: NamedRootKey }
  >();
  const captureSelection = (commandEditor: Editor, selection: Range | null) => {
    previewAnchor?.release();
    previewAnchor = selection
      ? commandEditor.anchor(selection, {
          association: 'inward',
          deletion: 'drop',
        })
      : null;
  };
  const captureTarget = (commandEditor: Editor, target?: Range) => {
    const selection =
      target ?? commandEditor.read.selection() ?? editor.read.selection();
    const viewNodes = target ? [] : commandEditor.read.selection.nodes();
    const selectedNodes = target
      ? []
      : viewNodes.length
        ? viewNodes
        : editor.read.selection.nodes();
    const isNodeSelecting = selectedNodes.length > 0;
    const blocks = isNodeSelecting
      ? selectedNodes
      : commandEditor.read.nodes.blocks({
          ...(selection ? { at: selection } : {}),
          mode: 'highest',
        });
    const root = commandEditor.read.view.root() ?? SelectionApi.root(selection);
    const isEndpoint = (path: Path, endpoint: Path | undefined) =>
      isNodeSelecting &&
      !!endpoint &&
      (PathApi.equals(path, endpoint) || PathApi.isAncestor(path, endpoint));

    captureSelection(commandEditor, selection);
    context.store.set({
      chatSelection: isNodeSelecting ? null : selection,
      chatNodes: blocks.flatMap(([node, path]) =>
        ElementApi.isElement(node)
          ? [
              {
                node,
                nodeKey: commandEditor.key(node),
                ...(isEndpoint(path, selection?.anchor.path)
                  ? { isSelectionAnchor: true as const }
                  : {}),
                ...(isEndpoint(path, selection?.focus.path)
                  ? { isSelectionFocus: true as const }
                  : {}),
                ...(root ? { root } : {}),
              },
            ]
          : []
      ),
    });
  };
  const restoreTarget = (commandEditor: Editor) => {
    const { chatNodes, chatSelection } = context.store.get();
    if (!chatSelection && chatNodes.length > 0) {
      const anchor = chatNodes.find((node) => node.isSelectionAnchor);
      const focus = chatNodes.find((node) => node.isSelectionFocus);
      const entries = chatNodes.flatMap(({ nodeKey }) => {
        const entry = commandEditor.read.nodes.get(nodeKey, {
          match: ElementApi.isElement,
        });
        return entry ? [entry] : [];
      });
      if (!anchor || !focus || entries.length !== chatNodes.length) {
        return false;
      }
      commandEditor.update.selection.setNodes(
        entries.map(([node]) => node),
        { anchor: anchor.nodeKey, focus: focus.nodeKey }
      );
      return true;
    }
    const selection = previewAnchor?.resolve();
    if (!selection) return false;
    commandEditor.update.selection.set(selection);
    return true;
  };
  const getActionEditor = (commandEditor: Editor) =>
    commandEditor as AIActionEditor;
  const columnGroupDescriptor = getCompiledPlatePlugin(
    editor,
    PLUGINS.columnGroup
  );
  const columnGroup = columnGroupDescriptor
    ? editor.plugin(columnGroupDescriptor)
    : undefined;
  const paragraph = editor.plugin(BaseParagraphPlugin);
  const tablePlugin = editor.plugin(BaseTablePlugin);
  const currentBlockPath = (state: AIChatInsertState) => {
    const blockKey = context.store.get('_blockKey');
    const generated = blockKey
      ? state.nodes.get(blockKey, { match: ElementApi.isElement })
      : undefined;
    const selection = state.selection();
    const selectionPath =
      state.selection.nodes().at(-1)?.[1] ?? selection?.focus.path;
    const path = generated?.[1] ?? selectionPath?.slice(0, 1) ?? [0];
    const entry = state.nodes.get(path, { match: ElementApi.isElement });
    const containerTypes = new Set<string>([
      ...(columnGroup ? [columnGroup.schema.type] : []),
      ...(tablePlugin.installed ? [tablePlugin.schema.type] : []),
    ]);

    return entry && containerTypes.has(entry[0].type)
      ? (state.nodes.above()?.[1] ?? path)
      : path;
  };
  const getInsertStart = (state: AIChatInsertState) => {
    const path = currentBlockPath(state);
    const startBlock = state.nodes.get(path, {
      match: ElementApi.isElement,
    })?.[0];

    return {
      path,
      startBlock,
      startInEmptyParagraph:
        !!startBlock &&
        NodeApi.string(startBlock).length === 0 &&
        startBlock.type === paragraph.schema.type,
    };
  };
  const createFormattedBlocks = ({
    blocks,
    format,
    sourceBlock,
  }: {
    blocks: Element[];
    format: 'all' | 'none' | 'single';
    sourceBlock: NodeEntry<Element>;
  }) => {
    if (format === 'none') return cloneDeep(blocks);

    const firstText = NodeApi.first(sourceBlock[0], [0]);

    if (!TextApi.isText(firstText[0])) return null;

    const blockProps = NodeApi.extractProps(sourceBlock[0]);
    const textProps = NodeApi.extractProps(firstText[0]);
    const applyTextFormatting = (node: Descendant): Descendant =>
      TextApi.isText(node)
        ? { ...textProps, ...node }
        : ElementApi.isElement(node)
          ? {
              ...node,
              children: node.children.map(applyTextFormatting),
            }
          : node;

    return blocks.map((block, index) =>
      format === 'single' && index > 0
        ? block
        : {
            ...block,
            ...blockProps,
            children: block.children.map(applyTextFormatting),
          }
    );
  };
  const stop = () => {
    void context.store.get().chat?.stop?.();
    context.store.set({
      streaming: false,
    });
  };
  const resetOptions = () => {
    stop();
    previewAnchor?.release();
    previewAnchor = null;
    tableDraft.clear();
    aiChatCommandEditors.delete(editor);

    const { chat } = context.store.get();

    if (chat?.messages.length) chat.clear();
    context.store.set({
      _blockKey: null,
      _blockRefs: {},

      _requestId: null,

      _tableCellRefs: {},
      chatNodes: [],
      chatSelection: null,
      mode: 'insert',
      previewValue: [],
      toolName: null,
    });
  };
  const resetEditor = (commandEditor: Editor) => {
    const selection = previewAnchor?.resolve();
    resetOptions();
    if (selection && !commandEditor.read.view.isReadOnly()) {
      commandEditor.update.selection.set(selection);
    }
  };
  const hideOptions = () => {
    context.store.set({ open: false });
  };
  const serializeMarkdown = (
    state: AIChatPluginReadState,
    { type }: { type: MarkdownType }
  ) => {
    if (type === 'editor') {
      return editor.api.markdown.serialize({
        value: state.value(),
      });
    }
    if (type === 'block') {
      const blocks = state.nodes.blocks().map(([node]) => node);

      return editor.api.markdown.serialize({
        value: { children: blocks },
      });
    }
    if (type === 'nodeSelection') {
      const fragment = state.fragment();
      const value: Element[] =
        fragment.length === 1 && ElementApi.isElement(fragment[0])
          ? [
              {
                children: fragment[0].children,
                type: paragraph.schema.type,
              },
            ]
          : fragment.flatMap((node) =>
              ElementApi.isElement(node) ? [node] : []
            );

      if (value.length !== fragment.length) {
        throw new Error('Node selections must contain block elements.');
      }

      return editor.api.markdown.serialize({
        value: { children: value },
      });
    }
    if (type !== 'tableCellWithRef') return '';

    if (!tablePlugin.installed) return '';

    const cells = tablePlugin.read.selection()?.cells ?? [];

    if (cells.length === 0) return '';
    const root = state.view.root() ?? SelectionApi.root(state.selection());
    const tableView = root ? createEditorView(editor, { root }) : null;
    const tableNodes = tableView?.read.nodes ?? state.nodes;
    const tableKey = (path: Path) =>
      tableView ? tableView.key(path) : state.key(path);

    const selectedNodeKeys = new Set(cells.map(([, path]) => tableKey(path)));
    const tableEntry = tableNodes.block({
      match: (node): node is Element =>
        ElementApi.isElement(node) && node.type === tablePlugin.schema.type,
    });

    if (!tableEntry) return '';
    const [table, tablePath] = tableEntry;

    const refs: AIChatPluginState['_tableCellRefs'] = {};
    const selectedCells: Array<{ cell: Element; ref: string }> = [];
    const rows = table.children.map((row, rowIndex) => {
      if (
        !ElementApi.isElement(row) ||
        row.type !== editor.plugin(BaseTableRowPlugin).schema.type
      ) {
        throw new Error('Tables must contain table rows.');
      }

      const values = row.children.map((cell, cellIndex) => {
        if (
          !ElementApi.isElement(cell) ||
          cell.type !== editor.plugin(BaseTableCellPlugin).schema.type
        ) {
          throw new Error('Table rows must contain table cells.');
        }

        const nodeKey = tableKey([...tablePath, rowIndex, cellIndex]);

        if (nodeKey && selectedNodeKeys.has(nodeKey)) {
          const ref = `c${selectedCells.length + 1}`;

          refs[ref] = { key: nodeKey, ...(root ? { root } : {}) };
          selectedCells.push({ cell, ref });

          return `<CellRef ref="${ref}" />`;
        }

        return cell.children
          .map((child) => {
            if (!ElementApi.isElement(child)) {
              throw new Error('Table cells must contain block elements.');
            }

            return editor.api.markdown
              .serialize({ value: { children: [child] } })
              .trim();
          })
          .filter(Boolean)
          .join('<br/>');
      });
      const markdown = `| ${values.join(' | ')} |`;

      return rowIndex === 0
        ? `${markdown}\n| ${values.map(() => '---').join(' | ')} |`
        : markdown;
    });
    const cellBlocks = selectedCells
      .map(({ cell, ref }) => {
        if (
          !cell.children.every((node): node is Element =>
            ElementApi.isElement(node)
          )
        ) {
          throw new Error('Table cells must contain block elements.');
        }

        return `<Cell ref="${ref}">\n${editor.api.markdown
          .serialize({ value: { children: cell.children } })
          .trim()}\n</Cell>`;
      })
      .join('\n\n');

    if (!context.store.get('_requestId')) {
      context.store.set({ _tableCellRefs: refs });
    }

    return `${rows.join('\n')}\n\n${cellBlocks}`;
  };
  const getRequestContext = (
    commandEditor: Editor,
    at: Range | null,
    selectedNodePaths: readonly Path[] = commandEditor.read.selection
      .nodes()
      .map(([, path]) => [...path])
  ): AIChatRequestContext => {
    const root =
      commandEditor.read.view.root() ??
      SelectionApi.root(at) ??
      SelectionApi.root(commandEditor.read.selection());
    const requestEditor = root
      ? createEditorView(commandEditor, { root })
      : commandEditor;
    const requestAt = at
      ? {
          ...at,
          anchor: { offset: at.anchor.offset, path: at.anchor.path },
          focus: { offset: at.focus.offset, path: at.focus.path },
        }
      : null;
    const [firstSelectedNodePath, ...remainingSelectedNodePaths] =
      selectedNodePaths;
    const isNodeSelecting = !!firstSelectedNodePath;
    const nodeSelection = (() => {
      if (!firstSelectedNodePath || !requestAt) return null;

      const paths: [Path, ...Path[]] = [
        firstSelectedNodePath,
        ...remainingSelectedNodePaths,
      ];
      const findEndpoint = (pointPath: Path) =>
        paths.find(
          (path) =>
            PathApi.equals(path, pointPath) ||
            PathApi.isAncestor(path, pointPath)
        );
      const anchorPath = findEndpoint(requestAt.anchor.path);
      const focusPath = findEndpoint(requestAt.focus.path);

      if (!anchorPath || !focusPath) {
        throw new Error(
          'Node selection endpoints must resolve in the request.'
        );
      }

      return { anchorPath, focusPath, paths };
    })();
    const blockRefs: AIChatPluginState['_blockRefs'] = {};
    const blocks = (
      isNodeSelecting
        ? requestEditor.read.nodes.blocks()
        : requestEditor.read.nodes.blocks({
            at: requestAt && RangeApi.isExpanded(requestAt) ? requestAt : [],
          })
    ).flatMap(([, path], index) => {
      const key = requestEditor.key(path);

      if (!key) return [];

      const ref = `b${index + 1}`;

      blockRefs[ref] = { key, ...(root ? { root } : {}) };

      return [{ path: [...path], ref }];
    });
    const tableCellRefs: AIChatPluginState['_tableCellRefs'] = {};
    const tableCells = tablePlugin.installed
      ? (
          requestEditor
            .plugin(BaseTablePlugin)
            .read.selection({ at: requestAt ?? undefined })?.cells ?? []
        ).flatMap(([, path], index) => {
          const key = requestEditor.key(path);

          if (!key) return [];

          const ref = `c${index + 1}`;

          tableCellRefs[ref] = { key, ...(root ? { root } : {}) };

          return [{ path: [...path], ref }];
        })
      : [];

    context.store.set({
      _blockRefs: blockRefs,
      _tableCellRefs: tableCellRefs,
    });

    return {
      children: [...requestEditor.read.children()],
      nodeSelection,
      refs: { blocks, tableCells },
      selection: requestAt,
    };
  };
  const resolvePrompt = (
    prompt: EditorPrompt,
    params: {
      editor: Editor;
      isNodeSelecting: boolean;
      isSelecting: boolean;
    }
  ) => {
    if (typeof prompt === 'function') return prompt(params);
    if (typeof prompt === 'string') return prompt;
    if (params.isNodeSelecting && prompt.nodeSelecting) {
      return prompt.nodeSelecting;
    }
    if (params.isSelecting && prompt.selecting) return prompt.selecting;

    return prompt.default;
  };
  const getPrompt = (
    state: AIChatPromptState,
    { prompt = '' }: { prompt?: EditorPrompt }
  ) =>
    resolvePrompt(prompt, {
      editor,
      isNodeSelecting: state.selection.nodes().length > 0,
      isSelecting: state.selection.isExpanded(),
    });
  const finishCompleteAction = () => {
    resetOptions();
    hideOptions();
  };
  const getActionChatBlocks = (tx: AIActionTransaction) => {
    const chatNodes = context.store.get('chatNodes');
    const entries = chatNodes.flatMap(({ nodeKey }) => {
      const entry = tx.nodes.get(nodeKey, {
        match: ElementApi.isElement,
      });

      return entry ? [entry] : [];
    });

    if (
      entries.length !== chatNodes.length ||
      new Set(entries.map(([node]) => tx.key(node))).size !== chatNodes.length
    ) {
      return [];
    }

    return entries.toSorted(([, a], [, b]) => PathApi.compare(a, b));
  };
  const selectActionEntries = (
    tx: AIActionTransaction,
    entries: ReadonlyArray<NodeEntry<Element>>
  ) => {
    tx.selection.setNodes(entries.map(([, path]) => path));
  };
  const resolveActionBlocks = (tx: AIActionTransaction, nodes: Element[]) => {
    const entries = nodes.flatMap((node) => {
      const entry = tx.nodes.get(tx.key(node), {
        match: ElementApi.isElement,
      });

      return entry ? [entry] : [];
    });

    if (entries.length !== nodes.length) {
      throw new Error('Inserted AI blocks must resolve exactly once.');
    }

    return entries;
  };
  const insertActionBlocks = (
    tx: AIActionTransaction,
    nodes: Element[],
    target: NodeEntry<Element>
  ) => {
    tx.blocks.insertAfter(nodes, { at: tx.key(target[0]) });
    selectActionEntries(tx, resolveActionBlocks(tx, nodes));
  };
  const replaceActionBlocks = (
    tx: AIActionTransaction,
    nodes: Element[],
    entries: ReadonlyArray<NodeEntry<Element>>
  ) => {
    const selectedKeys = entries.map(([node]) => tx.key(node));
    const firstKey = selectedKeys[0];

    if (!firstKey) return false;

    tx.nodes.insert(nodes, { at: firstKey });
    selectActionEntries(tx, resolveActionBlocks(tx, nodes));

    for (const key of selectedKeys.toReversed()) {
      tx.nodes.remove({ at: key });
    }

    return true;
  };
  const getActionPreviewSource = () => {
    const source = [...context.store.get('previewValue')];

    if (source.every((node) => editor.read.nodes.isEmpty(node))) {
      return undefined;
    }

    return source;
  };
  const acceptAIResponse = (commandEditor: Editor) => {
    if (tableDraft.size > 0) {
      let applied = false;
      getActionEditor(commandEditor).update((tx) => {
        const targets = [...tableDraft].map(([key, draft]) => ({
          draft,
          entry:
            draft.root === commandEditor.read.view.root()
              ? tx.nodes.get(key, { match: ElementApi.isElement })
              : undefined,
        }));
        if (targets.some(({ entry }) => !entry)) return;
        tx.history.newBatch();
        for (const { draft, entry } of targets) {
          if (entry) {
            tx.nodes.replaceChildren(cloneDeep(draft.children), {
              at: tx.key(entry[0]),
            });
          }
        }
        applied = true;
      });
      if (applied) finishCompleteAction();
      return;
    }
    if (context.store.get('mode') === 'chat') {
      completeDetachedOutput(commandEditor, 'replaceSelection', 'single');
      return;
    }
    let applied = false;
    getActionEditor(commandEditor).update((tx) => {
      const output = getActionPreviewSource();
      const blockKey = context.store.get('_blockKey');
      const target = blockKey
        ? tx.nodes.get(blockKey, { match: ElementApi.isElement })
        : undefined;
      if (!target || !output) return;
      tx.history.newBatch();
      const [node, path] = target;
      const replace =
        node.type === paragraph.schema.type && tx.nodes.isEmpty(node);
      const firstPath = replace ? path : PathApi.next(path);
      const firstIndex = firstPath.at(-1);
      if (firstIndex === undefined) return;
      if (replace) tx.nodes.replace(cloneDeep(output), { at: path });
      else tx.blocks.insertAfter(cloneDeep(output), { at: path });
      const lastPath = [
        ...firstPath.slice(0, -1),
        firstIndex + output.length - 1,
      ];
      const end = tx.points.end(lastPath);
      if (end) tx.selection.set(end);
      applied = true;
    });
    if (applied) finishCompleteAction();
  };
  const completeDetachedOutput = (
    commandEditor: Editor,
    action: 'insertBelow' | 'replaceSelection',
    format: 'all' | 'none' | 'single'
  ) => {
    let applied = false;

    getActionEditor(commandEditor).update((tx) => {
      const source = getActionPreviewSource();

      if (!source) return;
      const capturedSelection = context.store.get('chatSelection');
      const chatSelection =
        capturedSelection && previewAnchor
          ? previewAnchor.resolve()
          : capturedSelection;
      if (capturedSelection && previewAnchor && !chatSelection) return;

      if (chatSelection) {
        const [start, end] = RangeApi.edges(chatSelection);
        const block = tx.nodes.block({
          at: action === 'insertBelow' ? end : start,
        });

        if (!block) return;
        const blocks =
          format === 'none'
            ? cloneDeep(source)
            : createFormattedBlocks({
                blocks: cloneDeep(source),
                format,
                sourceBlock: block,
              });

        if (!blocks) return;
        tx.history.newBatch();

        if (action === 'insertBelow') {
          insertActionBlocks(tx, blocks, block);
          applied = true;
        } else {
          const openTextBlock = (node: Element | undefined) =>
            node &&
            !tx.schema.isVoid(node) &&
            node.children.every(
              (child) => TextApi.isText(child) || tx.schema.isInline(child)
            )
              ? 1
              : 0;

          applied = tx.slice.replace(
            ContentSlice.fromJSON({
              content: blocks,
              openStart: openTextBlock(blocks[0]),
              openEnd: openTextBlock(blocks.at(-1)),
            }),
            { at: chatSelection }
          );
        }

        return;
      }

      const selected = getActionChatBlocks(tx);

      if (selected.length === 0) return;
      const sourceBlock =
        action === 'insertBelow' ? selected.at(-1) : selected[0];

      if (!sourceBlock) return;
      const blocks =
        format === 'none' ||
        (action === 'replaceSelection' &&
          format === 'single' &&
          selected.length > 1)
          ? cloneDeep(source)
          : createFormattedBlocks({
              blocks: cloneDeep(source),
              format,
              sourceBlock,
            });

      if (!blocks) return;
      tx.history.newBatch();

      if (action === 'insertBelow') {
        insertActionBlocks(tx, blocks, sourceBlock);
        applied = true;
      } else {
        applied = replaceActionBlocks(tx, blocks, selected);
      }
    });

    if (applied) finishCompleteAction();
  };

  const show = (commandEditor: Editor, target?: Range) => {
    resetOptions();
    if (
      !target &&
      commandEditor.read.selection.nodes().length === 0 &&
      commandEditor.read.selection.isCollapsed() &&
      !commandEditor.read.selection.isAtBlockEnd()
    ) {
      const block = commandEditor.read.nodes.block();

      if (block && !commandEditor.read.nodes.isEmpty(block[0])) {
        commandEditor.update.selection.setNodes([block[1]]);
      }
    }
    captureTarget(commandEditor, target);
    aiChatCommandEditors.set(editor, commandEditor);
    context.store.set({ toolName: null });
    context.store.get().chat?.clear();
    context.store.set({ open: true });
  };

  return {
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) => {
        const { trigger, triggerPreviousCharPattern, triggerQuery } =
          context.store.get();
        const selection = state.selection();
        const matches =
          trigger instanceof RegExp
            ? trigger.test(input.text)
            : Array.isArray(trigger)
              ? trigger.includes(input.text)
              : input.text === trigger;

        if (
          !selection ||
          !matches ||
          (triggerQuery && !triggerQuery(context.editor))
        ) {
          return false;
        }

        const before = state.points.before(selection);
        const previous = before
          ? state.text.string({ anchor: before, focus: selection.anchor })
          : '';
        const block = state.nodes.block({ mode: 'highest' });

        if (
          !triggerPreviousCharPattern?.test(previous) ||
          !block ||
          !state.nodes.isEmpty(block[0])
        ) {
          return false;
        }

        return state.transaction((tx) => {
          tx.effects.emit(aiChatShowEffect, selection);
        });
      }),
    ],
    effectTypes: [aiChatShowEffect],
    on: {
      commit({ commit }) {
        const showEffect = commit.effects.find(
          (effect) => effect.type === aiChatShowEffect
        );
        if (showEffect) {
          show(editor, showEffect.value);
        }
      },
    },
    api: ({ editor: commandEditor }) => ({
      accept: () => acceptAIResponse(commandEditor),
      /** Close the session, cancel its request, and discard any unapplied draft. */
      hide: ({ focus = true }: { focus?: boolean } = {}) => {
        if (focus) resetEditor(commandEditor);
        else resetOptions();
        hideOptions();
        if (focus) commandEditor.api.dom.focus();
      },
      insertBelow: ({
        format = 'single',
      }: {
        format?: 'all' | 'none' | 'single';
      } = {}) => {
        completeDetachedOutput(commandEditor, 'insertBelow', format);
      },
      reload: () => {
        const { chat, toolName } = context.store.get();
        stop();
        context.store.set({
          _blockKey: null,
          _requestId: null,
          previewValue: [],
        });
        tableDraft.clear();
        if (!restoreTarget(commandEditor)) return;
        captureTarget(commandEditor);
        aiChatCommandEditors.set(editor, commandEditor);
        context.store.set({ _requestId: crypto.randomUUID() });

        void chat?.regenerate({
          body: {
            ctx: {
              ...getRequestContext(
                commandEditor,
                commandEditor.read.selection()
              ),
              toolName,
            },
          },
        });
      },
      replaceSelection: ({
        format = 'single',
      }: {
        format?: 'all' | 'none' | 'single';
      } = {}) => {
        completeDetachedOutput(commandEditor, 'replaceSelection', format);
      },
      reset: () => {
        resetEditor(commandEditor);
      },
      /** Publish the current complete Markdown response without editing the document. */
      setPreview: (
        content: string,
        { requestId }: { requestId?: string | null } = {}
      ) => {
        const state = context.store.get();
        if (requestId !== undefined && requestId !== state._requestId) return;

        let targetKey = state._blockKey;
        if (!targetKey) {
          const selection = previewAnchor
            ? previewAnchor.resolve()
            : (state.chatSelection ?? commandEditor.read.selection());
          if (previewAnchor && !selection) return;
          const target =
            state.chatNodes.length > 0 && !state.chatSelection
              ? commandEditor.read.nodes.get(state.chatNodes[0].nodeKey, {
                  match: ElementApi.isElement,
                })
              : commandEditor.read.nodes.block({
                  ...(selection ? { at: RangeApi.start(selection) } : {}),
                });
          if (!target) return;
          targetKey = commandEditor.key(target[0]);
          if (
            !previewAnchor &&
            selection &&
            (state.chatSelection || state.chatNodes.length === 0)
          ) {
            captureSelection(commandEditor, selection);
          }
        }
        if (!commandEditor.read.nodes.get(targetKey)) return;
        context.store.set({
          _blockKey: targetKey,
          previewValue: content
            ? commandEditor.plugin(MarkdownPlugin).api.deserialize(content)
                .children
            : [],
        });
      },
      /** Publish a complete cell response in the current table draft. */
      setTablePreview: (
        { content, ref }: TableCellUpdate,
        { requestId }: { requestId?: string | null } = {}
      ) => {
        if (
          requestId !== undefined &&
          requestId !== context.store.get('_requestId')
        ) {
          return;
        }
        const refs = context.store.get('_tableCellRefs');
        const target = Object.hasOwn(refs, ref) ? refs[ref] : undefined;
        if (!target || target.root !== commandEditor.read.view.root()) return;
        const cell = commandEditor.read.nodes.get(target.key, {
          match: ElementApi.isElement,
        });
        if (!cell) return;
        const table = commandEditor.read.nodes.above({
          at: cell[1],
          match: (node): node is Element =>
            ElementApi.isElement(node) && node.type === tablePlugin.schema.type,
        });
        if (!table) return;
        tableDraft.set(target.key, {
          children: commandEditor
            .plugin(MarkdownPlugin)
            .api.deserialize(content).children,
          root: target.root,
        });
        const previewNode = (node: Descendant, path: Path): Descendant => {
          if (!ElementApi.isElement(node)) return node;
          const key = commandEditor.key(path);
          const draft = key ? tableDraft.get(key) : undefined;
          return {
            ...node,
            children:
              draft?.children ??
              node.children.map((child, index) =>
                previewNode(child, [...path, index])
              ),
          };
        };
        const preview = previewNode(table[0], table[1]);
        if (!ElementApi.isElement(preview)) return;
        context.store.set({
          _blockKey: commandEditor.key(table[0]),
          previewValue: [preview],
        });
      },
      show: () => show(commandEditor),
      stop,
      submit: (
        input: string,
        {
          mode,
          options,
          prompt,
          toolName: requestedToolName,
        }: {
          mode?: AIMode;
          options?: ChatRequestOptions;
          prompt?: EditorPrompt;
          toolName?: AIToolName;
        } = {}
      ) => {
        const { chat, open: isOpen, toolName } = context.store.get();
        const nextToolName = requestedToolName ?? toolName ?? null;

        if (!prompt && input.length === 0) return;
        if (isOpen && !restoreTarget(commandEditor)) return;

        aiChatCommandEditors.set(editor, commandEditor);
        captureTarget(commandEditor);
        const selection =
          commandEditor.read.selection() ?? editor.read.selection();
        const selectedNodePaths = commandEditor.read.selection
          .nodes()
          .map(([, path]) => [...path]);
        const isNodeSelecting = selectedNodePaths.length > 0;
        tableDraft.clear();
        const nextMode =
          mode ??
          (isNodeSelecting || (selection && RangeApi.isExpanded(selection))
            ? 'chat'
            : 'insert');

        context.store.set({
          _blockKey: null,
          _requestId: crypto.randomUUID(),

          mode: nextMode,
          previewValue: [],
          streaming: false,
          toolName: nextToolName,
        });

        const requestContext = getRequestContext(
          commandEditor,
          selection ?? null,
          selectedNodePaths
        );
        const resolvedPrompt = resolvePrompt(prompt ?? input, {
          editor: commandEditor,
          isNodeSelecting,
          isSelecting: !!selection && RangeApi.isExpanded(selection),
        });
        const promptText =
          prompt === undefined
            ? resolvedPrompt
            : commandEditor
                .plugin(AIChatPlugin)
                .read.resolvePlaceholders(resolvedPrompt, { prompt: input });
        void chat?.sendMessage(promptText, {
          body: {
            ctx: {
              ...requestContext,
              toolName: nextToolName,
            },
          },
          ...options,
        });
      },
    }),
    read: ({ editor: commandEditor, state }) => ({
      commentRange: (comment: TComment) => {
        const blockRefs = context.store.get('_blockRefs');
        const blockRef = Object.hasOwn(blockRefs, comment.blockRef)
          ? blockRefs[comment.blockRef]
          : undefined;

        if (!blockRef) return undefined;

        const blockEditor = blockRef.root
          ? createEditorView(commandEditor, { root: blockRef.root })
          : commandEditor;
        const chatSelection = context.store.get('chatSelection');
        const isTextSelecting =
          !!chatSelection && RangeApi.isExpanded(chatSelection);
        const selection = isTextSelecting
          ? previewAnchor?.resolve(blockEditor)
          : null;
        if (isTextSelecting && !selection) return undefined;

        const refs = Object.values(blockRefs);
        const firstIndex = refs.indexOf(blockRef);
        const nodes = commandEditor.api.markdown.deserialize(
          comment.content
        ).children;
        const ranges: Range[] = [];
        let previousPath: Path | undefined;

        for (const [index, node] of nodes.entries()) {
          const ref = refs[firstIndex + index];
          if (!ref || ref.root !== blockRef.root) return undefined;
          const block = blockEditor.read.nodes.get(ref.key, {
            match: ElementApi.isElement,
          });
          if (!block) return undefined;

          if (previousPath) {
            const after = blockEditor.read.points.after(previousPath);
            const start = blockEditor.read.points.start(block[1]);
            if (!after || !start || !PointApi.equals(after, start)) {
              return undefined;
            }
          }
          previousPath = block[1];

          const segments = [...NodeApi.texts(block[0])].flatMap(
            ([leaf, path]) => {
              const anchor = {
                path: [...block[1], ...path],
                offset: 0,
                ...(blockRef.root ? { root: blockRef.root } : {}),
              };
              const leafRange = {
                anchor,
                focus: { ...anchor, offset: leaf.text.length },
              };
              const selected = selection
                ? RangeApi.intersection(selection, leafRange)
                : leafRange;
              if (!selected || RangeApi.isCollapsed(selected)) return [];
              const [start, end] = RangeApi.edges(selected);
              return [
                {
                  point: start,
                  text: leaf.text.slice(start.offset, end.offset),
                },
              ];
            }
          );

          const localRange = commandEditor
            .plugin(BaseAIPlugin)
            .api.findTextRangeInBlock({
              block: [
                {
                  ...block[0],
                  children: segments.map(({ text }) => ({ text })),
                },
                [],
              ],
              findText: NodeApi.string(node),
            });
          if (!localRange) return undefined;
          const start = segments[localRange.anchor.path[0]].point;
          const end = segments[localRange.focus.path[0]].point;
          ranges.push({
            anchor: {
              ...start,
              offset: start.offset + localRange.anchor.offset,
            },
            focus: { ...end, offset: end.offset + localRange.focus.offset },
          });
        }

        const first = ranges[0];
        const last = ranges.at(-1);

        if (!first || !last) return undefined;

        return { anchor: first.anchor, focus: last.focus };
      },
      insertStart: getInsertStart.bind(null, state),
      markdown: serializeMarkdown.bind(null, state),
      node: (
        options: Omit<EditorNodesOptions<Node>, 'type'> & {
          streaming?: boolean;
        } = {}
      ) => {
        const { streaming = false } = options;
        const blockKey = context.store.get('_blockKey');

        if (!blockKey || (streaming && !context.store.get('streaming'))) {
          return undefined;
        }

        return state.nodes.get(blockKey, { match: ElementApi.isElement });
      },
      prompt: getPrompt.bind(null, state),
      resolvePlaceholders: (
        text: string,
        { prompt }: { prompt?: string } = {}
      ) => {
        let result = text.split('{prompt}').join(prompt ?? '');
        const placeholders: Record<string, MarkdownType> = {
          '{block}': 'block',
          '{editor}': 'editor',
          '{nodeSelection}': 'nodeSelection',
          '{tableCellWithRef}': 'tableCellWithRef',
        };

        Object.entries(placeholders).forEach(([placeholder, type]) => {
          if (result.includes(placeholder)) {
            result = result
              .split(placeholder)
              .join(serializeMarkdown(state, { type }));
          }
        });

        return result;
      },
    }),
    selectors: {
      lastAssistantMessage: (state) =>
        state.chat?.messages.findLast(
          (message) => message.role === 'assistant'
        ),
    },
    activate: ({ onCleanup }) => {
      onCleanup(() => {
        previewAnchor?.release();
        previewAnchor = null;
        tableDraft.clear();
      });
    },
  };
});

export type AIChatDefinition = DefinitionOf<typeof AIChatPlugin>;
