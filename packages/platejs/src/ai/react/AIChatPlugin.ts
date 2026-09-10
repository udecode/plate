import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatRequestOptions, ChatStatus, UIMessage } from 'ai';

import {
  type DefinitionOf,
  type Element,
  ElementApi,
  type NamedRootKey,
  NodeApi,
  type NodeKey,
  PLUGINS,
  type Path,
  PathApi,
  type PlatePluginReadState,
  type Range,
  SelectionApi,
  createEditorView,
  defineEffect,
  editorCommands,
} from '../../core';
import type { TriggerComboboxPluginState } from '../../features/combobox';
import { BaseTablePlugin } from '../../features/table';
import { MarkdownPlugin } from '../../markdown';
import { type Editor, definePlatePlugin } from '../../react/core';
import { SuggestionPlugin } from '../../react/features/suggestion';
import type {
  AIChatRequestContext,
  AIToolName,
} from '../lib/AIChatRequestContext';
import { BaseAIPlugin } from '../lib/BaseAIPlugin';
import {
  createAIChatOperation,
  type AIChatOperation,
  type AIChatComment,
} from './internal/createAIChatOperation';

export type AIMode = 'chat' | 'insert';

type TComment = {
  blockRef: string;
  comment: string;
  content: string;
};

export type AIChatAdapter = {
  clear: () => void;
  messages: UIMessage[];
  regenerate: (options?: ChatRequestOptions) => Promise<void>;
  sendMessage: (text: string, options?: ChatRequestOptions) => Promise<void>;
  status: ChatStatus;
  stop: () => Promise<void> | void;
};

export const createAIChatAdapter = <TMessage extends UIMessage>(
  chat: UseChatHelpers<TMessage>
): AIChatAdapter => ({
  clear: () => {
    chat.setMessages([]);
  },
  messages: chat.messages,
  regenerate: chat.regenerate,
  sendMessage: (text, options) => chat.sendMessage({ text }, options),
  status: chat.status,
  stop: chat.stop,
});

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

export type AIChatPluginState = {
  operation: AIChatOperation | null;
  onCommentsAccepted: ((comments: readonly AIChatComment[]) => void) | null;
  _blockRefs: Record<string, Readonly<{ key: NodeKey; root?: NamedRootKey }>>;
  _tableCellRefs: Record<
    string,
    Readonly<{ key: NodeKey; root?: NamedRootKey }>
  >;
  chat: AIChatAdapter | null;
  mode: AIMode;
  open: boolean;
  toolName: AIToolName;
  trigger: NonNullable<TriggerComboboxPluginState['trigger']>;
  triggerPreviousCharPattern: NonNullable<
    TriggerComboboxPluginState['triggerPreviousCharPattern']
  >;
} & TriggerComboboxPluginState;

type MarkdownType = 'block' | 'editor' | 'nodeSelection' | 'tableCellWithRef';

const aiChatShowEffect = defineEffect({ key: 'ai.chat.show' });
const dependencies = [BaseAIPlugin, MarkdownPlugin, SuggestionPlugin] as const;

type AIChatPluginReadState = PlatePluginReadState<
  DefinitionOf<(typeof dependencies)[number]>
>;
type AIChatPromptState = Pick<AIChatPluginReadState, 'selection'>;

const initialState: AIChatPluginState = {
  operation: null,
  onCommentsAccepted: null,
  _blockRefs: {},
  _tableCellRefs: {},
  chat: null,
  mode: 'insert',
  open: false,
  toolName: null,
  trigger: ' ',
  triggerPreviousCharPattern: /^\s?$/,
};

export const AIChatPlugin = definePlatePlugin(PLUGINS.aiChat, {
  dependencies,
  initialState,
})
  .extend((context) => {
    const { editor } = context;
    let requestContext: AIChatRequestContext | null = null;
    const operation = createAIChatOperation(editor, (next) =>
      context.store.set({ operation: next })
    );
    const paragraph = editor.plugin(PLUGINS.paragraph);
    const tablePlugin = editor.plugin(BaseTablePlugin);
    const stop = () => {
      operation.stop();
      void context.store.get('chat')?.stop();
    };
    const resetOptions = () => {
      stop();
      operation.discard();
      const { chat } = context.store.get();
      if (chat?.messages.length) chat.clear();
      context.store.set({
        _blockRefs: {},
        _tableCellRefs: {},
        mode: 'insert',
        toolName: null,
      });
    };
    const reset = () => resetOptions();
    const hideOptions = ({ focus = true }: { focus?: boolean } = {}) => {
      resetOptions();
      context.store.set({ open: false });
      if (focus) editor.api.dom.focus();
    };
    const hide = hideOptions;
    const serializeMarkdown = (
      state: AIChatPluginReadState,
      { type }: { type: MarkdownType }
    ) => {
      context.store.set({ _tableCellRefs: {} });

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

      const cells = tablePlugin.read.selection()?.cellEntries ?? [];

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
          row.type !== editor.plugin(PLUGINS.tableRow).schema.type
        ) {
          throw new Error('Tables must contain table rows.');
        }

        const values = row.children.map((cell, cellIndex) => {
          if (
            !ElementApi.isElement(cell) ||
            cell.type !== editor.plugin(PLUGINS.tableCell).schema.type
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

      context.store.set({ _tableCellRefs: refs });

      return `${rows.join('\n')}\n\n${cellBlocks}`;
    };
    const getRequestContext = (at: Range | null): AIChatRequestContext => {
      const root =
        editor.read.view.root() ??
        SelectionApi.root(at) ??
        SelectionApi.root(editor.read.selection());
      const requestEditor = root ? createEditorView(editor, { root }) : editor;
      const requestAt = at
        ? {
            ...at,
            anchor: { offset: at.anchor.offset, path: at.anchor.path },
            focus: { offset: at.focus.offset, path: at.focus.path },
          }
        : null;
      const selectedNodePaths = requestEditor.read.selection
        .nodes()
        .map(([, path]) => [...path]);
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
          : requestEditor.read.nodes.blocks({ at: requestAt ?? [] })
      ).flatMap(([, path], index) => {
        const key = requestEditor.key(path);

        if (!key) return [];

        const ref = `b${index + 1}`;

        blockRefs[ref] = { key, ...(root ? { root } : {}) };

        return [{ path: [...path], ref }];
      });
      const tableCellRefs: AIChatPluginState['_tableCellRefs'] = {};
      const tableCells = tablePlugin.installed
        ? (tablePlugin.read.selection()?.cellEntries ?? []).flatMap(
            ([, path], index) => {
              const key = requestEditor.key(path);

              if (!key) return [];

              const ref = `c${index + 1}`;

              tableCellRefs[ref] = { key, ...(root ? { root } : {}) };

              return [{ path: [...path], ref }];
            }
          )
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
    const commentRange = (comment: TComment) => {
      const blockRefs = context.store.get('_blockRefs');
      const blockRef = Object.hasOwn(blockRefs, comment.blockRef)
        ? blockRefs[comment.blockRef]
        : undefined;

      if (!blockRef) return undefined;

      const blockEditor = blockRef.root
        ? createEditorView(editor, { root: blockRef.root })
        : editor;
      const firstBlock = blockEditor.read.nodes.get(blockRef.key, {
        match: ElementApi.isElement,
      });

      if (!firstBlock) return undefined;

      const nodes = editor.api.markdown.deserialize(comment.content).children;
      const ranges: Range[] = [];

      nodes.forEach((node, index) => {
        const block =
          index === 0
            ? firstBlock
            : blockEditor.read.nodes.get([firstBlock[1][0] + index], {
                match: ElementApi.isElement,
              });

        if (!block) return;

        const localRange = context.editor
          .plugin(BaseAIPlugin)
          .api.findTextRangeInBlock({
            block,
            findText: NodeApi.string(node),
          });
        const range =
          localRange && blockRef.root
            ? {
                anchor: { ...localRange.anchor, root: blockRef.root },
                focus: { ...localRange.focus, root: blockRef.root },
              }
            : localRange;

        if (range) ranges.push(range);
      });

      const first = ranges[0];
      const last = ranges.at(-1);

      if (!first || !last) return undefined;

      return { anchor: first.anchor, focus: last.focus };
    };
    const references = () => {
      const refs = {
        ...context.store.get('_blockRefs'),
        ...context.store.get('_tableCellRefs'),
      };
      return Object.values(refs).flatMap(({ key, root }) => {
        const view = root ? createEditorView(editor, { root }) : editor;
        const entry = view.read.nodes.get(key, { match: ElementApi.isElement });
        return entry ? [{ key, node: entry[0], root }] : [];
      });
    };
    const getPrompt = (
      state: AIChatPromptState,
      { prompt = '' }: { prompt?: EditorPrompt }
    ) => {
      const params = {
        editor,
        isNodeSelecting: state.selection.nodes().length > 0,
        isSelecting: state.selection.isExpanded(),
      };

      if (typeof prompt === 'function') return prompt(params);
      if (typeof prompt === 'string') return prompt;
      if (params.isNodeSelecting && prompt.nodeSelecting) {
        return prompt.nodeSelecting;
      }
      if (params.isSelecting && prompt.selecting) return prompt.selecting;

      return prompt.default;
    };

    return {
      api: () => ({
        /** Start a detached operation for a custom transport or recorded stream. */
        start: ({
          mode = 'insert',
          toolName = 'generate',
        }: { mode?: AIMode; toolName?: AIToolName } = {}) => {
          stop();
          context.store.set({ mode, toolName });
          return operation.start({ mode, edit: toolName === 'edit' });
        },
        hide,
        retry: () => {
          stop();
          const { chat, mode, toolName } = context.store.get();
          const id = operation.start({
            mode,
            edit: toolName === 'edit',
            retry: true,
          });
          void chat
            ?.regenerate({
              body: {
                requestId: id,
                ctx: {
                  ...requestContext,
                  toolName,
                },
              },
            })
            .catch((error) => operation.error(id, error));
          return id;
        },
        receive: operation.receive,
        receiveTool: (id: number, toolName: AIToolName) => {
          if (
            operation.current?.id !== id ||
            operation.current.status !== 'streaming'
          ) {
            return;
          }
          context.store.set({ toolName });
          operation.tool(id, toolName === 'edit');
        },
        receiveTable: (id: number, { ref, content }: TableCellUpdate) => {
          const reference = context.store.get('_tableCellRefs')[ref];
          if (reference) operation.table(id, reference.key, content);
          else {
            operation.error(id, new Error('Unknown AI table cell reference.'));
          }
        },
        receiveComment: (id: number, comment: TComment & { id: string }) => {
          const reference = context.store.get('_blockRefs')[comment.blockRef];
          const range = reference && commentRange(comment);
          if (reference && range) {
            operation.comment(id, reference.key, range, comment);
          } else {
            operation.error(
              id,
              new Error('The AI comment target cannot be found.')
            );
          }
        },
        finish: operation.finish,
        error: operation.error,
        discard: () => hideOptions(),
        accept: (options?: { placement?: 'replace' | 'below' }) => {
          const result = operation.accept(options);
          if (!result) return false;
          context.store.get('onCommentsAccepted')?.(result.comments);
          hideOptions();
          return true;
        },
        reset,
        show: () => {
          reset();
          context.store.set({ toolName: null });
          context.store.get().chat?.clear();
          context.store.set({ open: true });
        },
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
          const { chat, toolName } = context.store.get();
          const nextToolName = requestedToolName ?? toolName ?? null;

          if (!prompt && input.length === 0) return;

          const selection = editor.read.selection();
          const isNodeSelecting = editor.read.selection.nodes().length > 0;
          const nextMode =
            mode ??
            (isNodeSelecting || editor.read.selection.isExpanded()
              ? 'chat'
              : 'insert');

          stop();

          context.store.set({ mode: nextMode });
          context.store.set({ toolName: nextToolName });

          requestContext = getRequestContext(selection ?? null);
          const promptText = getPrompt(editor.read, {
            prompt: prompt ?? input,
          });
          const id = operation.start({
            mode: nextMode,
            edit: nextToolName === 'edit',
            references: references(),
          });
          void chat
            ?.sendMessage(promptText, {
              ...options,
              body: {
                ...options?.body,
                requestId: id,
                ctx: {
                  ...requestContext,
                  toolName: nextToolName,
                },
              },
            })
            .catch((error) => operation.error(id, error));
          return id;
        },
      }),
      read: ({ state }) => ({
        commentRange,
        markdown: serializeMarkdown.bind(null, state),
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
      on: { commit: () => operation.validate() },
      selectors: {
        lastAssistantMessage: (state) =>
          state.chat?.messages.findLast(
            (message) => message.role === 'assistant'
          ),
      },
    };
  })
  .extend((context) => ({
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
          tx.effects.emit(aiChatShowEffect, null);
        });
      }),
    ],
    effectTypes: [aiChatShowEffect],
    on: {
      commit({ commit }) {
        if (commit.effects.some((effect) => effect.type === aiChatShowEffect)) {
          context.api.show();
        }
      },
    },
  }));

export type AIChatDefinition = DefinitionOf<typeof AIChatPlugin>;
