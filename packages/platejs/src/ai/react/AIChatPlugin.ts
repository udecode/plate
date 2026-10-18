import type { ChatRequestOptions, ChatStatus, UIMessage } from 'ai';
import cloneDeep from 'lodash/cloneDeep.js';
import isEqual from 'lodash/isEqual.js';

import {
  type AuthoredResult,
  AuthoredPlugin,
  projectAuthoredDocument,
} from '../../authored';
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
  type Node,
  NodeApi,
  type NodeEntry,
  type NodeKey,
  type NodeSelectionMode,
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
import { canPlaceBlocksAtPath, placeElementAt } from '../../facade';
import { isListItem } from '../../features/list/lib/listIndex.internal';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../../features/table';
import { getCompiledPlatePlugin } from '../../internal/plugin/compilePlateModel';
import { resolveInsertionAnchor } from '../../internal/plugin/insertionAnchor';
import {
  type MarkdownSerializeResult,
  type MarkdownSliceParseResult,
  MarkdownPlugin,
} from '../../markdown';
import { type Editor, definePlugin } from '../../react/core';
import type {
  AIChatRequestContext,
  AIToolName,
} from '../lib/AIChatRequestContext';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import {
  captureTextRange,
  fillEmptyListItem,
  formatAIOutput,
  landAIOutput,
  suggestionBlocks,
  textEdits,
  wholeTextBlocks,
  withoutText,
} from './aiOutputLanding.internal';

export type AIMode = 'chat' | 'insert';

type TComment = {
  blockRef: string;
  comment: string;
  content: string;
};

const requireMarkdownData = (result: MarkdownSerializeResult) => {
  if (result.ok) return result.data;

  throw new Error(result.diagnostics.map(({ message }) => message).join('\n'));
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
};

export type AIChatPluginState = {
  _blockKey: NodeKey | null;
  _blockRefs: Record<string, Readonly<{ key: NodeKey }>>;
  _changeId: string | null;
  _requestId: string | null;
  _replaceNodeKeys: NodeKey[];
  _tableCellRefs: Record<string, Readonly<{ key: NodeKey }>>;
  chat: AIChatAdapter | null;
  chatNodeMode: NodeSelectionMode | null;
  chatNodes: AIChatNodeSnapshot[];
  chatSelection: Range | null;
  mode: AIMode;
  open: boolean;
  previewValue: Value;
  streaming: boolean;
  toolName: AIToolName;
  /** Text that opens AI Space, or a pattern tested against the typed text. */
  trigger: readonly string[] | RegExp | string;
  triggerPreviousCharPattern: RegExp;
  /** Return false to keep a typed trigger as plain text. */
  triggerQuery: ((editor: Editor) => boolean) | null;
};

type MarkdownType = 'block' | 'editor' | 'nodeSelection' | 'tableCellWithRef';

// Names the empty block AI Space opens in by its key: the typing that opens it
// may decide on a document whose positions differ from the stored one, and the
// key names the same block in both.
const aiChatShowEffect = defineEffect<NodeKey>({ key: 'ai.chat.show' });
const aiChatCommandEditors = new WeakMap<object, Editor>();
export const getAIChatCommandEditor = (editor: Editor) =>
  aiChatCommandEditors.get(editor) ?? editor;
const plateDependencies = [BaseAIPlugin, MarkdownPlugin] as const;
const dependencies = [
  ...plateDependencies,
  AuthoredPlugin,
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
/**
 * What a suggestion rewrites, fixed by its first chunk: whole source blocks
 * with their Markdown round trip, or a range inside one block.
 */
type AISuggestionTarget =
  | Readonly<{
      kind: 'blocks';
      paths: Path[];
      range: Range;
      roundTrip: readonly Element[] | null;
      source: readonly Element[];
    }>
  | Readonly<{ kind: 'text'; range: Range }>;

const initialState: AIChatPluginState = {
  _blockKey: null,
  _blockRefs: {},

  _changeId: null,
  _requestId: null,

  _replaceNodeKeys: [],
  _tableCellRefs: {},
  chat: null,
  chatNodeMode: null,
  chatNodes: [],
  chatSelection: null,
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
  let previewOwner: Readonly<{
    final: boolean;
    requestId: string | null;
  }> | null = null;
  // The latest partial parse, which the next preview of the same stream
  // continues, with the store's copies of its blocks.
  let previewParse:
    | Readonly<{ result: MarkdownSliceParseResult; stored: Value }>
    | undefined;
  // The stored blocks a draft chunk left, so the next chunk can tell whether
  // anyone wrote since.
  let suggestion: Readonly<{ children: readonly unknown[] }> | null = null;
  let suggestionTarget: AISuggestionTarget | null = null;
  const tableDraft = new Map<NodeKey, { children: Value }>();
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
    const viewSelection = target ? null : commandEditor.read.selection();
    const current = target ?? viewSelection ?? editor.read.selection();
    const viewNodes = target ? [] : commandEditor.read.selection.nodes();
    const nodeSource = viewNodes.length ? commandEditor : editor;
    const selectedNodes = target ? [] : nodeSource.read.selection.nodes();
    const isNodeSelecting = selectedNodes.length > 0;
    const root = current
      ? SelectionApi.root(current)
      : commandEditor.read.view.root();
    const captureEditor = createEditorView(commandEditor, root ? { root } : {});
    const selection =
      current && !isNodeSelecting
        ? captureEditor.read((state) => captureTextRange(state, current))
        : current;

    if (
      viewSelection &&
      selection &&
      !RangeApi.equals(selection, viewSelection)
    ) {
      commandEditor.update.selection.set(selection);
    }
    const blocks = isNodeSelecting
      ? selectedNodes
      : captureEditor.read.nodes.blocks(selection ? { at: selection } : {});
    const isEndpoint = (path: Path, endpoint: Path | undefined) =>
      isNodeSelecting &&
      !!endpoint &&
      (PathApi.equals(path, endpoint) || PathApi.isAncestor(path, endpoint));

    captureSelection(captureEditor, selection);
    context.store.set({
      chatNodeMode: isNodeSelecting
        ? nodeSource.read.selection.nodeMode()
        : null,
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
              },
            ]
          : []
      ),
    });
  };
  const prepareTargetRestore = (commandEditor: Editor) => {
    const { chatNodeMode, chatNodes, chatSelection } = context.store.get();
    const actionEditor = getActionEditor(commandEditor);
    if (!actionEditor) return null;
    if (!chatSelection && chatNodes.length > 0) {
      const anchor = chatNodes.find((node) => node.isSelectionAnchor);
      const focus = chatNodes.find((node) => node.isSelectionFocus);
      const entries = chatNodes.flatMap(({ nodeKey }) => {
        const entry = actionEditor.read.nodes.get(nodeKey, {
          match: ElementApi.isElement,
        });
        return entry ? [entry] : [];
      });
      if (!anchor || !focus || entries.length !== chatNodes.length) {
        return null;
      }
      const target = entries[0]?.[0];
      const { schema } = actionEditor.read;
      const mode =
        chatNodeMode === 'object' &&
        target &&
        !schema.isVoid(target) &&
        schema.isSelectable(target) &&
        (schema.isObject(target) || schema.isAtom(target))
          ? 'object'
          : 'block';
      return () =>
        actionEditor.update.selection.setNodes(
          entries.map(([node]) => node),
          { anchor: anchor.nodeKey, focus: focus.nodeKey, mode }
        );
    }
    const selection = previewAnchor?.resolve();
    if (!selection) return null;
    return () => actionEditor.update.selection.set(selection);
  };
  const restoreTarget = (commandEditor: Editor) => {
    const restore = prepareTargetRestore(commandEditor);
    restore?.();
    return !!restore;
  };
  const resolveTargetRoot = (commandEditor: Editor, key: NodeKey) => {
    const point = commandEditor.read.points.start(key);

    return point ? { root: point.root } : null;
  };
  const getActionEditor = (commandEditor: Editor, targetKey?: NodeKey) => {
    const { _blockKey, chatNodes, chatSelection } = context.store.get();
    const selection =
      suggestionTarget?.range ?? previewAnchor?.resolve() ?? chatSelection;
    const key =
      targetKey ??
      (suggestionTarget ? undefined : (_blockKey ?? chatNodes[0]?.nodeKey));
    const target = key
      ? resolveTargetRoot(commandEditor, key)
      : {
          root: selection
            ? SelectionApi.root(selection)
            : commandEditor.read.view.root(),
        };

    if (!target) return null;

    return createEditorView(
      commandEditor,
      target.root ? { root: target.root } : {}
    ) as AIActionEditor;
  };
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
  const stop = () => {
    void context.store.get().chat?.stop?.();
    context.store.set({
      streaming: false,
    });
  };
  // Retire the request before stopping its transport, so a closed or replaced
  // request cannot publish a final draft.
  const cancel = () => {
    context.store.set({ _requestId: null, streaming: false });
    void context.store.get().chat?.stop?.();
  };
  const reviewSucceeded = (result: AuthoredResult | null) =>
    result?.status === 'applied' || result?.status === 'unchanged';
  const decideCurrentChange = (action: 'accept' | 'reject') => {
    const changeId = context.store.get('_changeId');
    if (!changeId) return null;
    const authored = editor.plugin(AuthoredPlugin);
    const change = authored.read.change(changeId);
    const result: AuthoredResult = change
      ? authored.update.decide({ action, changes: [change] })
      : { ids: [changeId], status: 'unchanged' };

    if (reviewSucceeded(result)) {
      context.store.set({ _changeId: null, _replaceNodeKeys: [] });
    }

    return result;
  };
  const withReviewRecords = (blocks: readonly Element[]) => {
    const { records } = editor.read.value();

    return records
      ? { children: [...blocks], records }
      : { children: [...blocks] };
  };
  // Blocks as the proposed document shows them, without review marks.
  const proposedBlocks = (blocks: readonly Element[]) => {
    const projected = projectAuthoredDocument(withReviewRecords(blocks), {
      editor,
      projection: 'proposed',
    });

    // A schema that generates values builds no projection of pending
    // changes, so the blocks read as stored.
    return (projected.ok ? projected.document.children : blocks).filter(
      (node) => ElementApi.isElement(node)
    );
  };
  const resetOptions = () => {
    cancel();
    previewAnchor?.release();
    previewAnchor = null;
    previewOwner = null;
    previewParse = undefined;
    suggestion = null;
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
      chatNodeMode: null,
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
    const restore = prepareTargetRestore(commandEditor);
    resetOptions();
    if (restoreSelection && restore && !commandEditor.read.view.isReadOnly()) {
      restore();
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
      const document = state.value();

      return requireMarkdownData(
        editor.api.markdown.serialize({
          document: {
            children: document.children,
            ...(document.roots ? { roots: document.roots } : {}),
          },
          projection: 'proposed',
        })
      );
    }
    if (type === 'block') {
      const blocks = state.nodes.blocks().map(([node]) => node);

      return requireMarkdownData(
        editor.api.markdown.serialize({
          document: withReviewRecords(blocks),
          projection: 'proposed',
        })
      );
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

      return requireMarkdownData(
        editor.api.markdown.serialize({
          document: withReviewRecords(value),
          projection: 'proposed',
        })
      );
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

          refs[ref] = { key: nodeKey };
          selectedCells.push({ cell, ref });

          return `<CellRef ref="${ref}" />`;
        }

        return cell.children
          .map((child) => {
            if (!ElementApi.isElement(child)) {
              throw new Error('Table cells must contain block elements.');
            }

            return requireMarkdownData(
              editor.api.markdown.serialize({
                document: { children: [child] },
              })
            ).trim();
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

        return `<Cell ref="${ref}">\n${requireMarkdownData(
          editor.api.markdown.serialize({
            document: { children: cell.children },
          })
        ).trim()}\n</Cell>`;
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
    selectedNodePaths?: readonly Path[]
  ): AIChatRequestContext => {
    const current =
      at ?? commandEditor.read.selection() ?? editor.read.selection();
    const root = current
      ? SelectionApi.root(current)
      : commandEditor.read.view.root();
    const requestEditor = createEditorView(commandEditor, root ? { root } : {});
    const requestAt = at
      ? {
          ...at,
          anchor: { offset: at.anchor.offset, path: at.anchor.path },
          focus: { offset: at.focus.offset, path: at.focus.path },
        }
      : null;
    const [firstSelectedNodePath, ...remainingSelectedNodePaths] =
      selectedNodePaths ??
      requestEditor.read.selection.nodes().map(([, path]) => [...path]);
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

      return {
        anchorPath,
        focusPath,
        mode: requestEditor.read.selection.nodeMode() ?? 'block',
        paths,
      };
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

      blockRefs[ref] = { key };

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

          tableCellRefs[ref] = { key };

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
  const parseSuggestion = (
    answer: readonly Descendant[],
    target: AISuggestionTarget
  ) => {
    const snapshots = context.store.get('chatNodes');
    let source: Descendant[] = cloneDeep(snapshots.map(({ node }) => node));
    let tableCellSource = false;
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
        tableCellSource = true;
      }
    }
    if (!tableCellSource && ElementApi.isElementList(answer)) {
      if (target.kind === 'blocks') {
        return suggestionBlocks(editor, editor.read, {
          answer,
          roundTrip: target.roundTrip,
          source: target.source,
        });
      }

      const block = source[0];

      return landAIOutput(editor, editor.read, answer, {
        block: ElementApi.isElement(block) ? block : undefined,
        kind: 'kept',
      });
    }

    return answer.map((node, index) => {
      const sourceNode = source[index];

      if (
        !ElementApi.isElement(node) ||
        !ElementApi.isElement(sourceNode) ||
        sourceNode.type !== node.type
      ) {
        return node;
      }

      return {
        ...NodeApi.extractProps(sourceNode),
        ...node,
        children: node.children,
      };
    });
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
    tx.selection.setNodes(entries.map(([node]) => node));
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
    source: Element[],
    format: 'all' | 'none' | 'single',
    target: NodeEntry<Element>
  ) => {
    const anchor = resolveInsertionAnchor(editor, tx, target);
    // An answer that lands past its source, such as after the closed Details of
    // a title, takes none of the source's formatting: a copied title type has no
    // place outside its Details.
    const blocks = formatAIOutput({
      blocks: source,
      format: anchor === target ? format : 'none',
      sourceBlock: target[0],
    });

    if (!blocks) return false;
    tx.history.newBatch();

    const nodes = placeActionBlocks(
      tx,
      landAIOutput(editor, tx, blocks, { block: anchor[0], kind: 'kept' }),
      PathApi.next(anchor[1])
    );

    const inserted =
      nodes && tx.blocks.insert(nodes, { after: tx.key(anchor[0]) });

    if (!inserted) return false;
    tx.selection.setNodes(inserted);

    return true;
  };
  const placeActionBlocks = (
    tx: AIActionTransaction,
    nodes: readonly Element[],
    first: Path,
    // A caller that writes through tx.nodes.insert or tx.nodes.replace passes
    // the sibling indexes it removes, because neither checks how many children
    // the parent can hold; tx.blocks.insert and tx.slice.replace refuse alone.
    removing?: readonly number[]
  ) => {
    const parentPath = PathApi.parent(first);
    const index = first.at(-1) ?? 0;
    const placed: Element[] = [];

    for (const [offset, node] of nodes.entries()) {
      const block = placeElementAt(tx.schema, node, {
        at: [...parentPath, index + offset],
        root: tx.view.root(),
      });

      if (!block) return null;
      placed.push(block);
    }

    if (
      removing &&
      !canPlaceBlocksAtPath(tx.schema, first, placed, {
        removing,
        root: tx.view.root(),
      })
    ) {
      return null;
    }

    return placed;
  };
  const replaceActionBlocks = (
    tx: AIActionTransaction,
    nodes: Element[],
    entries: ReadonlyArray<NodeEntry<Element>>
  ) => {
    const selectedKeys = entries.map(([node]) => tx.key(node));
    const firstKey = selectedKeys[0];
    const first = entries[0];

    if (!firstKey || !first) return false;
    const removing = entries.flatMap(([, path]) =>
      PathApi.equals(PathApi.parent(path), PathApi.parent(first[1]))
        ? [path.at(-1) ?? 0]
        : []
    );
    const replacingFirst = placeActionBlocks(tx, nodes, first[1], removing);
    const keepingRequiredFirst = replacingFirst
      ? null
      : placeActionBlocks(tx, nodes, PathApi.next(first[1]));
    const landed = replacingFirst ?? keepingRequiredFirst;

    if (!landed) return false;
    if (replacingFirst) tx.nodes.insert(replacingFirst, { at: firstKey });
    else if (!tx.blocks.insert(landed, { after: firstKey })) return false;
    selectActionEntries(tx, resolveActionBlocks(tx, landed));

    for (const key of (replacingFirst
      ? selectedKeys
      : selectedKeys.slice(1)
    ).toReversed()) {
      tx.nodes.remove({ at: key });
    }

    return true;
  };
  const getActionPreviewSource = () => {
    if (
      !previewOwner?.final ||
      previewOwner.requestId !== context.store.get('_requestId')
    ) {
      return undefined;
    }
    const source = [...context.store.get('previewValue')];

    if (source.every((node) => editor.read.nodes.isEmpty(node))) {
      return undefined;
    }

    return source;
  };
  const writeSuggestion = (
    tx: AIActionTransaction,
    target: AISuggestionTarget,
    nextNodes: Descendant[]
  ) => {
    const paths = target.kind === 'blocks' ? target.paths : [];
    const sourceNodes = paths.flatMap((path) => {
      const entry = tx.nodes.get(path, { match: ElementApi.isElement });

      return entry ? [entry[0]] : [];
    });

    if (
      target.kind === 'blocks' &&
      sourceNodes.length === paths.length &&
      isEqual(sourceNodes.map(withoutText), nextNodes.map(withoutText))
    ) {
      const edits = sourceNodes.flatMap((sourceNode, blockIndex) => {
        const nextNode = nextNodes[blockIndex];
        const blockPath = paths[blockIndex];

        if (!nextNode || !blockPath) return [];
        const afterTexts = [...NodeApi.texts(nextNode)];

        return [...NodeApi.texts(sourceNode)].flatMap(
          ([before, path], textIndex) => {
            const after = afterTexts[textIndex]?.[0];

            return after && before.text !== after.text
              ? textEdits(before.text, after.text).map((edit) => ({
                  ...edit,
                  path: [...blockPath, ...path],
                }))
              : [];
          }
        );
      });

      for (const { from, path, text, to } of edits.toSorted(
        (left, right) =>
          PathApi.compare(right.path, left.path) || right.from - left.from
      )) {
        if (to > from) {
          tx.text.delete({
            at: {
              anchor: { offset: from, path },
              focus: { offset: to, path },
            },
          });
        }
        if (text) tx.text.insert(text, { at: { offset: from, path } });
      }

      return edits.length > 0;
    }

    return tx.slice.replace(
      ContentSlice.fromJSON({
        content: nextNodes,
        openEnd: 0,
        openStart: 0,
      }),
      { at: target.range }
    );
  };
  const applySuggestion = (
    commandEditor: Editor,
    content: string,
    { requestId }: { requestId?: string | null } = {}
  ) => {
    const state = context.store.get();
    if (requestId !== undefined && requestId !== state._requestId) return false;
    const actionEditor = getActionEditor(commandEditor);
    if (!actionEditor) return false;
    const sourceRoots = new Set(
      state.chatNodes.map(
        ({ nodeKey }) => resolveTargetRoot(commandEditor, nodeKey)?.root
      )
    );
    const root = actionEditor.read.view.root();

    if (
      !suggestionTarget &&
      (sourceRoots.size !== 1 || !sourceRoots.has(root))
    ) {
      return false;
    }
    if (state.chatSelection && previewAnchor && !previewAnchor.resolve()) {
      return false;
    }

    const currentChangeId = state._changeId;
    const capturedSelection = state.chatSelection;
    const parsed = editor.api.markdown.parseSlice(content);

    // A response Markdown cannot represent clears the draft, so an earlier
    // response cannot be accepted in its place.
    if (!parsed.ok) {
      const result = decideCurrentChange('reject');
      if (!result || reviewSucceeded(result)) suggestion = null;

      return false;
    }

    const targetKeys = state.chatNodes.map(({ nodeKey }) => nodeKey);
    if (
      targetKeys.length === 0 ||
      new Set(targetKeys).size !== targetKeys.length
    ) {
      return false;
    }
    let target = suggestionTarget;

    if (!target) {
      const entries = targetKeys.flatMap((key) => {
        const entry = actionEditor.read.nodes.get(key, {
          match: ElementApi.isElement,
        });

        return entry ? [entry] : [];
      });
      if (entries.length !== targetKeys.length) return false;
      const ordered = entries.toSorted(([, a], [, b]) => PathApi.compare(a, b));
      const first = ordered[0];
      const last = ordered.at(-1);
      if (!first || !last) return false;
      const anchor = actionEditor.read.points.start(first[1]);
      const focus = actionEditor.read.points.end(last[1]);
      const capturedEdges = capturedSelection
        ? RangeApi.edges(capturedSelection)
        : null;
      const coversWholeBlocks =
        !capturedEdges ||
        (!!anchor &&
          !!focus &&
          PointApi.equals(capturedEdges[0], anchor) &&
          PointApi.equals(capturedEdges[1], focus));

      const range =
        capturedSelection ??
        (anchor && focus
          ? { anchor, focus }
          : actionEditor.read.ranges.fromEntries(ordered));

      if (!range) return false;
      if (coversWholeBlocks) {
        const source = proposedBlocks(ordered.map(([node]) => node));
        const serialized = editor.api.markdown.serialize({
          document: { children: source },
        });
        const reparsed = serialized.ok
          ? editor.api.markdown.parseSlice(serialized.data)
          : undefined;

        target = {
          kind: 'blocks',
          paths: ordered.map(([, path]) => path),
          range,
          roundTrip:
            reparsed?.ok && ElementApi.isElementList(reparsed.slice.content)
              ? reparsed.slice.content
              : null,
          source,
        };
      } else {
        target = { kind: 'text', range };
      }
      suggestionTarget = target;
    }
    const nextNodes = parseSuggestion(parsed.slice.content, target);
    if (suggestion && actionEditor.read.children() !== suggestion.children) {
      return false;
    }
    const previous = currentChangeId
      ? editor.plugin(AuthoredPlugin).read.change(currentChangeId)
      : null;

    if (previous) {
      actionEditor.update((tx) => {
        tx.history.merge();
        tx.plugin(AuthoredPlugin).decide({
          action: 'reject',
          changes: [previous],
        });
      });
    }

    let publishedChangeId: string | null = null;
    actionEditor.update((tx) => {
      const changeId = tx
        .plugin(AuthoredPlugin)
        .propose(currentChangeId ? { changeId: currentChangeId } : undefined);
      if (currentChangeId) tx.history.merge();
      else tx.history.newBatch();
      if (writeSuggestion(tx, target, nextNodes)) publishedChangeId = changeId;
    });

    suggestion = { children: actionEditor.read.children() };
    context.store.set({
      _changeId: publishedChangeId,
      _replaceNodeKeys: publishedChangeId ? targetKeys : [],
      previewValue: [],
    });

    return publishedChangeId !== null;
  };
  const acceptAIResponse = (commandEditor: Editor) => {
    if (context.store.get('_changeId')) {
      const result = decideCurrentChange('accept');
      if (result && reviewSucceeded(result)) finishCompleteAction();
      return result;
    }
    if (tableDraft.size > 0) {
      let applied = false;
      getActionEditor(commandEditor)?.update((tx) => {
        const targets = [...tableDraft].map(([key, draft]) => ({
          draft,
          entry:
            resolveTargetRoot(commandEditor, key)?.root === tx.view.root()
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
      return undefined;
    }
    if (context.store.get('mode') === 'chat') {
      completeDetachedOutput(commandEditor, 'replaceSelection', 'single');
      return undefined;
    }
    let applied = false;
    getActionEditor(commandEditor)?.update((tx) => {
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
      const [anchor, anchorPath] = replace
        ? target
        : resolveInsertionAnchor(editor, tx, target);
      const firstPath = replace ? path : PathApi.next(anchorPath);
      const firstIndex = firstPath.at(-1);
      if (firstIndex === undefined) return;
      const blocks = cloneDeep(
        replace
          ? isListItem(node)
            ? landAIOutput(editor, tx, fillEmptyListItem(output, node), {
                block: node,
                kind: 'replaced',
              })
            : landAIOutput(editor, tx, output, { kind: 'line', line: target })
          : landAIOutput(editor, tx, output, { block: anchor, kind: 'kept' })
      );
      const placed = placeActionBlocks(
        tx,
        blocks,
        firstPath,
        replace ? [firstIndex] : undefined
      );

      if (!placed) return;

      let last: NodeKey | Path | undefined;

      if (replace) {
        if (!tx.nodes.replace(placed, { at: path })) return;
        last = [...firstPath.slice(0, -1), firstIndex + placed.length - 1];
      } else {
        last = tx.blocks.insert(placed, { after: anchorPath })?.at(-1);
        if (!last) return;
      }

      const end = tx.points.end(last);
      if (end) tx.selection.set(end);
      applied = true;
    });
    if (applied) finishCompleteAction();
    return undefined;
  };
  const completeDetachedOutput = (
    commandEditor: Editor,
    action: 'insertBelow' | 'replaceSelection',
    format: 'all' | 'none' | 'single'
  ) => {
    let applied = false;

    getActionEditor(commandEditor)?.update((tx) => {
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
        if (action === 'insertBelow') {
          applied = insertActionBlocks(tx, cloneDeep(source), format, block);

          return;
        }

        const blocks = formatAIOutput({
          blocks: cloneDeep(source),
          format,
          sourceBlock: block[0],
        });

        if (!blocks) return;
        tx.history.newBatch();

        const whole = wholeTextBlocks(tx, chatSelection, (first) =>
          landAIOutput(editor, tx, blocks, { block: first, kind: 'replaced' })
        );

        if (whole) {
          applied = replaceActionBlocks(tx, whole.nodes, whole.blocks);

          return;
        }

        const landed = landAIOutput(editor, tx, blocks, {
          block: block[0],
          kind: 'kept',
        });
        const openTextBlock = (node: Element | undefined) =>
          node &&
          !tx.schema.isVoid(node) &&
          node.children.every(
            (child) => TextApi.isText(child) || tx.schema.isInline(child)
          )
            ? 1
            : 0;
        const [head, ...rest] = landed;
        const tail =
          head && openTextBlock(head)
            ? placeActionBlocks(tx, rest, PathApi.next(block[1]))
            : rest;

        if (!tail) return;
        const content = head ? [head, ...tail] : landed;

        applied = tx.slice.replace(
          ContentSlice.fromJSON({
            content,
            openStart: openTextBlock(content[0]),
            openEnd: openTextBlock(content.at(-1)),
          }),
          { at: chatSelection }
        );

        return;
      }

      const selected = getActionChatBlocks(tx);

      if (selected.length === 0) return;
      const sourceBlock =
        action === 'insertBelow' ? selected.at(-1) : selected[0];

      if (!sourceBlock) return;
      if (action === 'insertBelow') {
        applied = insertActionBlocks(
          tx,
          cloneDeep(source),
          format,
          sourceBlock
        );

        return;
      }

      const blocks = formatAIOutput({
        blocks: cloneDeep(source),
        format: format === 'single' && selected.length > 1 ? 'none' : format,
        sourceBlock: sourceBlock[0],
      });

      if (!blocks) return;
      tx.history.newBatch();
      applied = replaceActionBlocks(
        tx,
        landAIOutput(editor, tx, blocks, {
          block: sourceBlock[0],
          kind: 'replaced',
        }),
        selected
      );
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

        const key = state.key(block[1]);

        if (!key) return false;

        return state.transaction((tx) => {
          tx.effects.emit(aiChatShowEffect, key);
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
          const start = editor.read.points.start(showEffect.value);

          show(editor, start && { anchor: start, focus: start });
        }
      },
    },
    api: ({ editor: commandEditor }) => ({
      /**
       * Commit the final draft in one history batch. Refuses a partial or
       * invalid draft and a target that no longer exists.
       */
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
      /** Cancel the request, discard its draft, and request a new response. */
      reload: () => {
        const { chat, toolName } = context.store.get();
        cancel();
        const result = decideCurrentChange('reject');
        if (result && !reviewSucceeded(result)) return result;
        suggestion = null;
        suggestionTarget = null;
        previewOwner = null;
        previewParse = undefined;
        context.store.set({
          _blockKey: null,
          _requestId: null,
          _replaceNodeKeys: [],
          previewValue: [],
        });
        tableDraft.clear();
        if (!restoreTarget(commandEditor)) return undefined;
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
      /** Cancel the request and discard its draft without publishing it. */
      reset: () => resetEditor(commandEditor),
      /**
       * Publish accumulated output to its request-owned review presentation.
       * A `final` parse (the default) is strict; a response Markdown cannot
       * represent clears the draft.
       */
      setPreview: (
        content: string,
        {
          final = true,
          requestId,
        }: { final?: boolean; requestId?: string | null } = {}
      ) => {
        const state = context.store.get();
        if (requestId !== undefined && requestId !== state._requestId) {
          return undefined;
        }
        if (state.toolName === 'edit' && state.mode === 'chat') {
          return applySuggestion(commandEditor, content, { requestId });
        }

        const ownerRequestId = requestId ?? state._requestId;
        const invalidatePreview = () => {
          previewOwner = { final: false, requestId: ownerRequestId };
          previewParse = undefined;
          context.store.set({ previewValue: [] });
        };
        let targetKey = state._blockKey;
        if (!targetKey) {
          const selection = previewAnchor
            ? previewAnchor.resolve()
            : (state.chatSelection ?? commandEditor.read.selection());
          const actionEditor = getActionEditor(commandEditor);
          if ((previewAnchor && !selection) || !actionEditor) {
            invalidatePreview();
            return undefined;
          }
          const target =
            state.chatNodes.length > 0 && !state.chatSelection
              ? actionEditor.read.nodes.get(state.chatNodes[0].nodeKey, {
                  match: ElementApi.isElement,
                })
              : actionEditor.read.nodes.block({
                  ...(selection ? { at: RangeApi.start(selection) } : {}),
                });
          if (!target) {
            invalidatePreview();
            return undefined;
          }
          targetKey = actionEditor.key(target[0]);
          if (
            !previewAnchor &&
            selection &&
            (state.chatSelection || state.chatNodes.length === 0)
          ) {
            captureSelection(actionEditor, selection);
          }
        }
        if (!commandEditor.read.nodes.get(targetKey)) {
          invalidatePreview();
          return undefined;
        }
        const previous = previewParse;
        const parsed = content
          ? commandEditor.api.markdown.parseSlice(
              content,
              // Previews show unsupported content as text; the final parse is
              // strict and invalidates a response it cannot represent. Both
              // continue the latest partial result.
              final
                ? { previous: previous?.result }
                : {
                    lossPolicy: 'allow',
                    partial: true,
                    previous: previous?.result,
                  }
            )
          : null;

        previewParse = undefined;
        if (parsed && !parsed.ok) {
          invalidatePreview();
          return undefined;
        }
        const previewValue = parsed?.slice.content ?? [];

        if (
          !previewValue.every((node): node is Element =>
            ElementApi.isElement(node)
          )
        ) {
          invalidatePreview();
          return undefined;
        }
        const reused = previous?.result.ok ? previous.result.slice.content : [];

        previewOwner = { final, requestId: ownerRequestId };
        // The store keeps its own copy of each value. Handing back its copy of
        // every block the parser reused keeps that block's identity for readers.
        context.store.set({
          _blockKey: targetKey,
          previewValue: previewValue.map((node, index) =>
            node === reused[index] ? (previous?.stored[index] ?? node) : node
          ),
        });
        if (parsed && !final) {
          previewParse = {
            result: parsed,
            stored: context.store.get('previewValue'),
          };
        }
        return undefined;
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
        if (!target) return;
        const actionEditor = getActionEditor(commandEditor, target.key);
        if (
          !actionEditor ||
          actionEditor.read.view.root() !==
            getActionEditor(commandEditor)?.read.view.root()
        ) {
          return;
        }
        const cell = actionEditor.read.nodes.get(target.key, {
          match: ElementApi.isElement,
        });
        if (!cell) return;
        const table = actionEditor.read.nodes.above({
          at: cell[1],
          match: (node): node is Element =>
            ElementApi.isElement(node) && node.type === tablePlugin.schema.type,
        });
        if (!table) return;
        const parsed = commandEditor.api.markdown.parseSlice(content);

        if (!parsed.ok) return;
        if (
          !parsed.slice.content.every((node): node is Element =>
            ElementApi.isElement(node)
          )
        ) {
          return;
        }
        tableDraft.set(target.key, {
          children: landAIOutput(
            editor,
            actionEditor.read,
            parsed.slice.content,
            {
              block: cell[0].children.find((node): node is Element =>
                ElementApi.isElement(node)
              ),
              kind: 'replaced',
            }
          ),
        });
        const previewNode = (node: Descendant, path: Path): Descendant => {
          if (!ElementApi.isElement(node)) return node;
          const key = actionEditor.key(path);
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
          _blockKey: actionEditor.key(table[0]),
          previewValue: [preview],
        });
      },
      show: () => show(commandEditor),
      /** Stop the request and publish its current response as the final draft. */
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

        if (!prompt && input.length === 0) return undefined;
        const discarded = decideCurrentChange('reject');
        if (discarded && !reviewSucceeded(discarded)) return discarded;
        suggestion = null;
        suggestionTarget = null;
        previewOwner = null;
        previewParse = undefined;
        if (isOpen && !restoreTarget(commandEditor)) return discarded;

        aiChatCommandEditors.set(editor, commandEditor);
        captureTarget(commandEditor);
        const selection =
          commandEditor.read.selection() ?? editor.read.selection();
        const viewNodes = commandEditor.read.selection.nodes();
        const selectedNodePaths = (
          viewNodes.length ? viewNodes : editor.read.selection.nodes()
        ).map(([, path]) => [...path]);
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

        const blockEditor = getActionEditor(commandEditor, blockRef.key);
        if (!blockEditor) return undefined;
        const root = blockEditor.read.view.root();
        const chatSelection = context.store.get('chatSelection');
        const isTextSelecting =
          !!chatSelection && RangeApi.isExpanded(chatSelection);
        const selection = isTextSelecting
          ? previewAnchor?.resolve(blockEditor)
          : null;
        if (isTextSelecting && !selection) return undefined;

        const refs = Object.values(blockRefs);
        const firstIndex = refs.indexOf(blockRef);
        const parsed = commandEditor.api.markdown.parseSlice(comment.content);

        if (!parsed.ok) return undefined;
        const nodes = parsed.slice.content;
        const ranges: Range[] = [];
        let previousPath: Path | undefined;

        for (const [index, node] of nodes.entries()) {
          const ref = refs[firstIndex + index];
          if (
            !ref ||
            resolveTargetRoot(commandEditor, ref.key)?.root !== root
          ) {
            return undefined;
          }
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
                ...(root ? { root } : {}),
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
        previewParse = undefined;
        tableDraft.clear();
      });
    },
  };
});

export type AIChatDefinition = DefinitionOf<typeof AIChatPlugin>;
