import type { ChatRequestOptions, ChatStatus, UIMessage } from 'ai';
import cloneDeep from 'lodash/cloneDeep.js';
import isEqual from 'lodash/isEqual.js';

import {
  type AuthoredPlugin,
  type AuthoredResult,
  DefaultAuthoredPlugin,
  readAuthoredFormatSnapshot,
} from '../../authored';
import {
  BaseParagraphPlugin,
  ContentSlice,
  DocumentChange,
  type Anchor,
  type DefinitionOf,
  type Descendant,
  type EditorNodesOptions,
  type EditorDocumentValue,
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
  _changeId: string | null;
  _requestId: string | null;
  _replaceNodeKeys: NodeKey[];
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
const dependencies = [
  ...plateDependencies,
  DefaultAuthoredPlugin,
  HistoryPlugin,
] as const;

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
type AuthoredAIEditor = Editor<Value, readonly [AuthoredPlugin]>;
type AuthoredAITransaction = EditorUpdateTransaction<
  Value,
  readonly [AuthoredPlugin]
>;

const initialState: AIChatPluginState = {
  _blockKey: null,
  _blockRefs: {},

  _changeId: null,
  _requestId: null,

  _replaceNodeKeys: [],
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
  const authoredEditor = editor as AuthoredAIEditor;
  let previewAnchor: Anchor<Range> | null = null;
  let suggestionBase: EditorDocumentValue | null = null;
  let suggestionChange: DocumentChange | null = null;
  let suggestionPaths: Path[] | null = null;
  let suggestionTarget: Range | null = null;
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
  const reviewSucceeded = (result: AuthoredResult | null) =>
    result?.status === 'applied' || result?.status === 'unchanged';
  const decideCurrentChange = (action: 'accept' | 'reject') => {
    const changeId = context.store.get('_changeId');
    if (!changeId) return null;
    const result = authoredEditor.update.authored.decide({
      action,
      selection: authoredEditor.read.authored.select({ ids: [changeId] }),
    });

    if (reviewSucceeded(result)) {
      context.store.set({ _changeId: null, _replaceNodeKeys: [] });
    }

    return result;
  };
  const resetOptions = () => {
    stop();
    previewAnchor?.release();
    previewAnchor = null;
    suggestionBase = null;
    suggestionChange = null;
    suggestionPaths = null;
    suggestionTarget = null;
    tableDraft.clear();
    aiChatCommandEditors.delete(editor);

    const { chat } = context.store.get();

    if (chat?.messages.length) chat.clear();
    context.store.set({
      _blockKey: null,
      _blockRefs: {},

      _changeId: null,
      _requestId: null,

      _replaceNodeKeys: [],
      _tableCellRefs: {},
      chatNodes: [],
      chatSelection: null,
      mode: 'insert',
      previewValue: [],
      toolName: null,
    });
  };
  const resetEditor = (
    commandEditor: Editor,
    { restoreSelection = true }: { restoreSelection?: boolean } = {}
  ) => {
    const result = decideCurrentChange('reject');
    if (result && !reviewSucceeded(result)) return result;
    const selection = previewAnchor?.resolve();
    resetOptions();
    if (
      restoreSelection &&
      selection &&
      !commandEditor.read.view.isReadOnly()
    ) {
      commandEditor.update.selection.set(selection);
    }

    return result;
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
  const deserializeSuggestion = (content: string) => {
    const snapshots = context.store.get('chatNodes');
    let source: Descendant[] = cloneDeep(snapshots.map(({ node }) => node));
    const first = source[0];

    if (
      source.length === 1 &&
      ElementApi.isElement(first) &&
      tablePlugin.installed &&
      first.type === tablePlugin.schema.type &&
      first.children.length === 1
    ) {
      const row = first.children[0];
      const cell =
        ElementApi.isElement(row) && row.children.length === 1
          ? row.children[0]
          : undefined;
      const tableCell = editor.plugin(BaseTableCellPlugin);

      if (
        tableCell.installed &&
        ElementApi.isElement(cell) &&
        cell.type === tableCell.schema.type
      ) {
        source = [...cell.children];
      }
    }

    return editor.api.markdown
      .deserialize(content)
      .children.map((node, index) =>
        ElementApi.isElement(node)
          ? {
              ...node,
              ...source[index],
              children: node.children,
            }
          : node
      );
  };
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
  const createSuggestionDraft = (
    commandEditor: Editor,
    selection: Range,
    nextNodes: Descendant[]
  ) => {
    const root = commandEditor.read.view.root();
    const { proposed } = readAuthoredFormatSnapshot(authoredEditor);
    const base = suggestionBase ?? proposed;
    if (
      suggestionChange &&
      !DocumentChange.between(suggestionChange.apply(base), proposed).empty
    ) {
      return undefined;
    }
    const draftEditor = createEditorView(authoredEditor, {
      authored: { intent: 'edit', projection: 'proposed' },
      ...(root ? { root } : {}),
    });
    const rollback = Symbol('ai-suggestion-draft');
    let result:
      | {
          base: EditorDocumentValue;
          change: DocumentChange;
          delta: DocumentChange;
        }
      | undefined;

    try {
      draftEditor.update((tx) => {
        if (suggestionChange) {
          tx.changes.apply(suggestionChange.invert(base));
        }
        const structure = (node: Descendant): Descendant =>
          TextApi.isText(node)
            ? { ...node, text: '' }
            : { ...node, children: node.children.map(structure) };
        const paths = suggestionPaths;
        const sourceNodes = paths?.flatMap((path) => {
          const entry = tx.nodes.get(path, { match: ElementApi.isElement });

          return entry ? [entry[0]] : [];
        });
        let replaced = false;
        let granularChange: DocumentChange | null = null;
        const document = () => {
          const children = cloneDeep(tx.children());

          return root
            ? {
                ...proposed,
                roots: { ...proposed.roots, [root]: children },
              }
            : { ...proposed, children };
        };

        if (
          sourceNodes &&
          sourceNodes.length === paths?.length &&
          isEqual(sourceNodes.map(structure), nextNodes.map(structure))
        ) {
          const edits: Array<{
            from: number;
            path: Path;
            text: string;
            to: number;
          }> = [];
          const textEdits = (before: string, after: string) => {
            type Chunk = { kind: 'delete' | 'equal' | 'insert'; text: string };
            const beforeTokens = Array.from(before);
            const afterTokens = Array.from(after);
            const chunks: Chunk[] = [];
            const append = (kind: Chunk['kind'], token: string) => {
              const previous = chunks.at(-1);
              if (previous?.kind === kind) previous.text += token;
              else chunks.push({ kind, text: token });
            };
            const isSubsequence = (source: string[], target: string[]) => {
              let sourceIndex = 0;
              for (const token of target) {
                if (source[sourceIndex] === token) sourceIndex += 1;
              }

              return sourceIndex === source.length;
            };

            if (isSubsequence(beforeTokens, afterTokens)) {
              let beforeIndex = 0;
              for (const token of afterTokens) {
                if (beforeTokens[beforeIndex] === token) {
                  append('equal', token);
                  beforeIndex += 1;
                } else {
                  append('insert', token);
                }
              }
            } else if (isSubsequence(afterTokens, beforeTokens)) {
              let afterIndex = 0;
              for (const token of beforeTokens) {
                if (afterTokens[afterIndex] === token) {
                  append('equal', token);
                  afterIndex += 1;
                } else {
                  append('delete', token);
                }
              }
            } else if (
              (beforeTokens.length + 1) * (afterTokens.length + 1) <=
              1_000_000
            ) {
              const lengths = Array.from(
                { length: beforeTokens.length + 1 },
                () => new Uint32Array(afterTokens.length + 1)
              );
              for (let left = beforeTokens.length - 1; left >= 0; left -= 1) {
                for (
                  let right = afterTokens.length - 1;
                  right >= 0;
                  right -= 1
                ) {
                  lengths[left][right] =
                    beforeTokens[left] === afterTokens[right]
                      ? lengths[left + 1][right + 1] + 1
                      : Math.max(
                          lengths[left + 1][right],
                          lengths[left][right + 1]
                        );
                }
              }
              let left = 0;
              let right = 0;
              while (left < beforeTokens.length && right < afterTokens.length) {
                if (beforeTokens[left] === afterTokens[right]) {
                  append('equal', beforeTokens[left]);
                  left += 1;
                  right += 1;
                } else if (
                  lengths[left + 1][right] >= lengths[left][right + 1]
                ) {
                  append('delete', beforeTokens[left]);
                  left += 1;
                } else {
                  append('insert', afterTokens[right]);
                  right += 1;
                }
              }
              while (left < beforeTokens.length) {
                append('delete', beforeTokens[left]);
                left += 1;
              }
              while (right < afterTokens.length) {
                append('insert', afterTokens[right]);
                right += 1;
              }
            } else {
              let prefix = 0;
              while (
                prefix < before.length &&
                prefix < after.length &&
                before[prefix] === after[prefix]
              ) {
                prefix += 1;
              }
              let suffix = 0;
              while (
                suffix < before.length - prefix &&
                suffix < after.length - prefix &&
                before.at(-suffix - 1) === after.at(-suffix - 1)
              ) {
                suffix += 1;
              }
              chunks.push(
                { kind: 'equal', text: before.slice(0, prefix) },
                {
                  kind: 'delete',
                  text: before.slice(prefix, before.length - suffix),
                },
                {
                  kind: 'insert',
                  text: after.slice(prefix, after.length - suffix),
                },
                { kind: 'equal', text: before.slice(before.length - suffix) }
              );
            }

            const inner: Array<{ from: number; text: string; to: number }> = [];
            let beforeOffset = 0;
            let index = 0;
            while (index < chunks.length) {
              const chunk = chunks[index];
              if (chunk.kind === 'equal') {
                beforeOffset += chunk.text.length;
                index += 1;
                continue;
              }
              const from = beforeOffset;
              let inserted = '';
              while (index < chunks.length && chunks[index].kind !== 'equal') {
                const change = chunks[index];
                if (change.kind === 'delete') {
                  beforeOffset += change.text.length;
                } else {
                  inserted += change.text;
                }
                index += 1;
              }
              inner.push({ from, text: inserted, to: beforeOffset });
            }

            return inner;
          };

          sourceNodes.forEach((source, blockIndex) => {
            const target = nextNodes[blockIndex];
            const blockPath = paths?.[blockIndex];
            if (!target || !blockPath) return;
            const beforeTexts = [...NodeApi.texts(source)];
            const afterTexts = [...NodeApi.texts(target)];

            beforeTexts.forEach(([before, path], textIndex) => {
              const after = afterTexts[textIndex]?.[0];
              if (!after || before.text === after.text) return;
              textEdits(before.text, after.text).forEach(
                ({ from, text, to }) => {
                  edits.push({
                    from,
                    path: [...blockPath, ...path],
                    text,
                    to,
                  });
                }
              );
            });
          });

          edits
            .toSorted(
              (left, right) =>
                PathApi.compare(right.path, left.path) || right.from - left.from
            )
            .forEach(({ from, path, text, to }) => {
              const before = document();
              if (to > from) {
                tx.text.delete({
                  at: {
                    anchor: { offset: from, path },
                    focus: { offset: to, path },
                  },
                });
              }
              if (text) tx.text.insert(text, { at: { offset: from, path } });
              const step = DocumentChange.between(before, document());
              granularChange = granularChange
                ? granularChange.compose(step)
                : step;
            });
          replaced = true;
        }
        const openTextBlock = (node: Descendant | undefined) =>
          ElementApi.isElement(node) &&
          !tx.schema.isVoid(node) &&
          node.children.every(
            (child) => TextApi.isText(child) || tx.schema.isInline(child)
          )
            ? 1
            : 0;
        if (!replaced) {
          replaced = tx.slice.replace(
            ContentSlice.fromJSON({
              content: nextNodes,
              openStart: openTextBlock(nextNodes[0]),
              openEnd: openTextBlock(nextNodes.at(-1)),
            }),
            { at: selection }
          );
        }

        if (!replaced) return;

        const next = document();
        const change = granularChange ?? DocumentChange.between(base, next);
        const delta = suggestionChange
          ? suggestionChange.invert(base).compose(change, proposed)
          : change;

        result = {
          base,
          change,
          delta,
        };
        // The draft transaction only computes the exact proposed document.
        // Publish its canonical change through the request-owned transaction.
        throw rollback;
      });
    } catch (error) {
      if (error !== rollback) throw error;
    }

    return result;
  };
  const applySuggestion = (
    commandEditor: Editor,
    content: string,
    { requestId }: { requestId?: string | null } = {}
  ) => {
    const state = context.store.get();
    if (requestId !== undefined && requestId !== state._requestId) return false;
    const sourceRoots = new Set(state.chatNodes.map(({ root }) => root));
    const root = commandEditor.read.view.root();

    if (sourceRoots.size !== 1 || !sourceRoots.has(root)) {
      return false;
    }
    if (state.chatSelection && previewAnchor && !previewAnchor.resolve()) {
      return false;
    }

    const currentChangeId = state._changeId;
    const capturedSelection = state.chatSelection;
    const nextNodes = deserializeSuggestion(content);
    const targetKeys = state.chatNodes.map(({ nodeKey }) => nodeKey);
    if (
      targetKeys.length === 0 ||
      new Set(targetKeys).size !== targetKeys.length
    ) {
      return false;
    }
    if (!capturedSelection) {
      const acceptedView = createEditorView(authoredEditor, {
        authored: { intent: 'edit', projection: 'accepted' },
        ...(root ? { root } : {}),
      });
      if (targetKeys.some((key) => !acceptedView.read.nodes.get(key))) {
        return false;
      }
    }
    if (!suggestionPaths && !suggestionTarget) {
      const proposedView = createEditorView(authoredEditor, {
        authored: { intent: 'edit', projection: 'proposed' },
        ...(root ? { root } : {}),
      });
      const entries = targetKeys.flatMap((key) => {
        const entry = proposedView.read.nodes.get(key, {
          match: ElementApi.isElement,
        });

        return entry ? [entry] : [];
      });
      if (entries.length !== targetKeys.length) return false;
      const ordered = entries.toSorted(([, a], [, b]) => PathApi.compare(a, b));
      const first = ordered[0];
      const last = ordered.at(-1);
      if (!first || !last) return false;
      const anchor = proposedView.read.points.start(first[1]);
      const focus = proposedView.read.points.end(last[1]);
      const capturedEdges = capturedSelection
        ? RangeApi.edges(capturedSelection)
        : null;
      const coversWholeBlocks =
        !capturedEdges ||
        (!!anchor &&
          !!focus &&
          PointApi.equals(capturedEdges[0], anchor) &&
          PointApi.equals(capturedEdges[1], focus));

      suggestionPaths = coversWholeBlocks
        ? ordered.map(([, path]) => path)
        : [];
      if (!capturedSelection) {
        suggestionTarget =
          anchor && focus
            ? { anchor, focus }
            : (proposedView.read.ranges.fromEntries(ordered) ?? null);
      }
    }
    const target = capturedSelection ?? suggestionTarget;
    if (!target) return false;
    const draft = createSuggestionDraft(commandEditor, target, nextNodes);
    if (!draft || draft.delta.empty) return false;

    let applied = false;
    let publishedChangeId: string | null = null;
    commandEditor.update((transaction) => {
      const tx = transaction as unknown as AuthoredAITransaction &
        AIActionTransaction;
      const changeId = tx.authored.propose(
        currentChangeId ? { changeId: currentChangeId } : undefined
      );
      if (currentChangeId) tx.history.merge();
      else tx.history.newBatch();
      tx.changes.apply(draft.delta);
      publishedChangeId = changeId;
      applied = true;
    });

    if (applied && publishedChangeId && draft) {
      suggestionBase = draft.base;
      suggestionChange = draft.change;
      context.store.set({
        _changeId: publishedChangeId,
        _replaceNodeKeys: targetKeys,
        previewValue: [],
      });
    }

    return applied;
  };
  const acceptAIResponse = (commandEditor: Editor) => {
    if (context.store.get('_changeId')) {
      const result = decideCurrentChange('accept');
      if (result && reviewSucceeded(result)) finishCompleteAction();
      return result;
    }
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
    const result = resetEditor(commandEditor);
    if (result && !reviewSucceeded(result)) return result;
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

    return result;
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
        const result = resetEditor(commandEditor, {
          restoreSelection: focus,
        });
        if (result && !reviewSucceeded(result)) return result;
        hideOptions();
        if (focus) commandEditor.api.dom.focus();

        return result;
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
        const result = decideCurrentChange('reject');
        if (result && !reviewSucceeded(result)) return result;
        suggestionBase = null;
        suggestionChange = null;
        suggestionPaths = null;
        suggestionTarget = null;
        context.store.set({
          _blockKey: null,
          _requestId: null,
          _replaceNodeKeys: [],
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

        return result;
      },
      replaceSelection: ({
        format = 'single',
      }: {
        format?: 'all' | 'none' | 'single';
      } = {}) => {
        completeDetachedOutput(commandEditor, 'replaceSelection', format);
      },
      reset: () => resetEditor(commandEditor),
      /** Publish accumulated output to its request-owned review presentation. */
      setPreview: (
        content: string,
        { requestId }: { requestId?: string | null } = {}
      ) => {
        const state = context.store.get();
        if (requestId !== undefined && requestId !== state._requestId) return;
        if (state.toolName === 'edit' && state.mode === 'chat') {
          return applySuggestion(commandEditor, content, { requestId });
        }

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
        const discarded = decideCurrentChange('reject');
        if (discarded && !reviewSucceeded(discarded)) return discarded;
        suggestionBase = null;
        suggestionChange = null;
        suggestionPaths = null;
        suggestionTarget = null;
        if (isOpen && !restoreTarget(commandEditor)) return discarded;

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
          _changeId: null,
          _requestId: crypto.randomUUID(),

          mode: nextMode,
          previewValue: [],
          _replaceNodeKeys: [],
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

        return discarded;
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
