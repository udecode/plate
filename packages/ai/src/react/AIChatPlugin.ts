import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatRequestOptions, ChatStatus, UIMessage } from 'ai';
import cloneDeep from 'lodash/cloneDeep.js';

import type { TriggerComboboxPluginState } from '@platejs/combobox';
import {
  type DeserializeMdOptions,
  MarkdownPlugin,
  type SerializeMdOptions,
} from '@platejs/markdown';
import {
  BlockSelectionPlugin,
  CursorOverlayPlugin,
} from '@platejs/selection/react';
import { SUGGESTION_TRANSIENT_KEY } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { BaseTablePlugin } from '@platejs/table';
import {
  type Descendant,
  type EditorNodesOptions,
  type Element,
  ElementApi,
  type Node,
  NodeApi,
  type NodeEntry,
  type Path,
  PathApi,
  type Range,
  type Value,
  defineEffect,
  editorCommands,
  schema,
  TextApi,
} from '@platejs/plite';
import {
  type DefinitionOf,
  type IdElement,
  nanoid,
  type PlatePluginReadState,
} from '@platejs/core';
import { type PlateEditor, definePlatePlugin } from '@platejs/core/react';
import { PLUGINS } from '@platejs/utils';

import { AI_PREVIEW_KEY, BaseAIPlugin } from '../lib/BaseAIPlugin';

export type AIMode = 'chat' | 'insert';

export type AIToolName = 'comment' | 'edit' | 'generate' | null;

type TComment = {
  blockId: string;
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
  clear: () => chat.setMessages([]),
  messages: chat.messages,
  regenerate: chat.regenerate,
  sendMessage: (text, options) => chat.sendMessage({ text }, options),
  status: chat.status,
  stop: chat.stop,
});

export type EditorPromptParams = {
  editor: PlateEditor;
  isBlockSelecting: boolean;
  isSelecting: boolean;
};

export type EditorPrompt =
  | ((params: EditorPromptParams) => string)
  | {
      default: string;
      blockSelecting?: string;
      selecting?: string;
    }
  | string;

export type TableCellUpdate = {
  content: string;
  id: string;
};

export type AIChatPluginState = {
  _blockChunks: string;
  _blockPath: Path | null;
  _mdxName: string | null;
  _replaceIds: string[];
  chat: AIChatAdapter | null;
  chatNodes: Array<IdElement & { id: string }>;
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

type MarkdownType =
  | 'block'
  | 'blockSelection'
  | 'blockSelectionWithBlockId'
  | 'blockWithBlockId'
  | 'editor'
  | 'editorWithBlockId'
  | 'tableCellWithId';

type StreamInsertOptions = {
  autoScroll?: boolean;
  elementProps?: Record<string, unknown>;
  textProps?: Record<string, unknown>;
};

const STREAM_LINE_BREAK_PLACEHOLDER = '\uE000platejs-stream-line-break\uE000';
const statMdxTagRegex = /<([A-Za-z][A-Za-z0-9._:-]*)(?:\s[^>]*?)?(?<!\/)>/;
const aiChatShowEffect = defineEffect({ key: 'ai.chat.show' });
const dependencies = [
  BaseAIPlugin,
  MarkdownPlugin,
  BlockSelectionPlugin,
  CursorOverlayPlugin,
  SuggestionPlugin,
] as const;

type AIChatPluginReadState = PlatePluginReadState<
  DefinitionOf<(typeof dependencies)[number]>
>;
type AIChatInsertState = Pick<AIChatPluginReadState, 'nodes' | 'selection'>;
type AIChatPromptState = Pick<AIChatPluginReadState, 'blockSelection'>;

const initialState: AIChatPluginState = {
  _blockChunks: '',
  _blockPath: null,
  _mdxName: null,
  _replaceIds: [],
  chat: null,
  chatNodes: [],
  chatSelection: null,
  mode: 'insert',
  open: false,
  previewValue: [],
  streaming: false,
  toolName: null,
  trigger: ' ',
  triggerPreviousCharPattern: /^\s?$/,
};

export const AIChatPlugin = definePlatePlugin(PLUGINS.aiChat, {
  dependencies,
  initialState,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
})
  .extend((context) => {
    const editor = context.editor;
    const codeBlock = editor.plugin(PLUGINS.codeBlock);
    const columnGroup = editor.plugin(PLUGINS.columnGroup);
    const equation = editor.plugin(PLUGINS.equation);
    const paragraph = editor.plugin(PLUGINS.paragraph);
    const ai = editor.plugin(BaseAIPlugin);
    const suggestionKey = editor.plugin(SuggestionPlugin).schema.key;
    const tablePlugin = editor.plugin(BaseTablePlugin);
    const getChunkTrimmed = (
      chunk: string,
      { direction = 'right' }: { direction?: 'left' | 'right' } = {}
    ) => {
      const trimmed =
        direction === 'right' ? chunk.trimEnd() : chunk.trimStart();

      return direction === 'right'
        ? chunk.slice(trimmed.length)
        : chunk.slice(0, chunk.length - trimmed.length);
    };
    const isCompleteCodeBlock = (value: string) => {
      const trimmed = value.trim();

      return trimmed.startsWith('```') && trimmed.endsWith('```');
    };
    const isCompleteMath = (value: string) => {
      const trimmed = value.trim();

      return (
        trimmed.length > 4 && trimmed.startsWith('$$') && trimmed.endsWith('$$')
      );
    };
    function withNodeProps(
      nodes: readonly Element[],
      options: StreamInsertOptions
    ): Element[];
    function withNodeProps(
      nodes: readonly Descendant[],
      options: StreamInsertOptions
    ): Descendant[];
    function withNodeProps(
      nodes: readonly Descendant[],
      options: StreamInsertOptions
    ): Descendant[] {
      return nodes.map((node) => {
        if (!ElementApi.isElement(node)) {
          return { ...options.textProps, ...node, text: node.text };
        }

        let element = node;

        if (node.listStyleType && node.listStart) {
          const previous = editor.read.nodes.previous<Element>({
            at: editor.read.selection()?.focus,
          })?.[0];

          if (
            !(previous?.listStyleType && previous.listStart) &&
            node.listStart !== 1
          ) {
            element = { ...node, listRestartPolite: node.listStart };
          }
        }

        return {
          ...element,
          ...options.elementProps,
          children: withNodeProps(node.children, options),
        };
      });
    }
    const isSameNode = (left: Descendant, right: Descendant) => {
      if (
        left.type !== editor.plugin(PLUGINS.paragraph).schema.type ||
        right.type !== editor.plugin(PLUGINS.paragraph).schema.type
      ) {
        return left.type === right.type;
      }

      return left.listStyleType !== undefined ||
        right.listStyleType !== undefined
        ? left.listStyleType === right.listStyleType
        : left.type === right.type;
    };
    const deserializeInlineChunk = (
      text: string,
      options?: DeserializeMdOptions
    ) => {
      try {
        return editor.api.markdown.deserializeInline(text, options);
      } catch {
        return editor.api.markdown.deserializeInline(text, {
          ...options,
          withoutMdx: true,
        });
      }
    };
    const deserializeChunk = (data: string, options?: DeserializeMdOptions) => {
      let input = data;

      if (data.startsWith('$$') && !isCompleteMath(data)) {
        input = data.replace('$$', String.raw`\$\$`);
      }

      const mdxName = context.store.get('_mdxName');

      if (mdxName) {
        if (input.includes(`</${mdxName}>`)) {
          context.store.set({ _mdxName: null });
        } else {
          return [
            {
              children: [{ text: input }],
              type: editor.plugin(PLUGINS.paragraph).schema.type,
            },
          ];
        }
      } else {
        const nextMdxName = statMdxTagRegex.exec(input)?.[1];

        if (nextMdxName && input.startsWith(`<${nextMdxName}`)) {
          context.store.set({ _mdxName: nextMdxName });
        }
      }

      const deserializeOptions = {
        ...options,
        preserveEmptyParagraphs: false,
      };
      const blocks = (() => {
        try {
          return editor.api.markdown.deserialize(input, deserializeOptions)
            .children;
        } catch {
          return editor.api.markdown.deserialize(input, {
            ...deserializeOptions,
            withoutMdx: true,
          }).children;
        }
      })();
      let result: Descendant[] = blocks.map((node) =>
        ElementApi.isElement(node)
          ? {
              ...node,
              children: [...node.children],
              ...(equation.installed &&
              node.type === equation.schema.type &&
              typeof node.texExpression === 'string'
                ? { texExpression: node.texExpression.trim() }
                : {}),
            }
          : node
      );
      const trailing = getChunkTrimmed(data);
      const lastBlock = result.at(-1);
      const addNewLine = trailing === '\n\n';
      const prependNewLine =
        getChunkTrimmed(data, { direction: 'left' }) === '\n\n';
      const isCodeBlockOrTable =
        (codeBlock.installed && lastBlock?.type === codeBlock.schema.type) ||
        (tablePlugin.installed && lastBlock?.type === tablePlugin.schema.type);

      if (
        lastBlock &&
        ElementApi.isElement(lastBlock) &&
        !isCodeBlockOrTable &&
        trailing.length > 0 &&
        !addNewLine
      ) {
        const lastChild = lastBlock.children.at(-1);

        if (
          lastChild &&
          TextApi.isText(lastChild) &&
          Object.keys(lastChild).length === 1
        ) {
          result = [
            ...result.slice(0, -1),
            {
              ...lastBlock,
              children: [
                ...lastBlock.children.slice(0, -1),
                { text: lastChild.text + trailing },
              ],
            },
          ];
        } else {
          result = [
            ...result.slice(0, -1),
            {
              ...lastBlock,
              children: [...lastBlock.children, { text: trailing }],
            },
          ];
        }
      }
      if (addNewLine && !isCodeBlockOrTable) {
        result.push({ children: [{ text: '' }], type: paragraph.schema.type });
      }
      if (prependNewLine && !isCodeBlockOrTable) {
        result.unshift({
          children: [{ text: '' }],
          type: paragraph.schema.type,
        });
      }

      if (
        !result.every((node): node is Element => ElementApi.isElement(node))
      ) {
        throw new Error('Markdown documents must contain block elements.');
      }

      return result;
    };
    const serializeChunk = (options: SerializeMdOptions, chunk: string) => {
      const { value: source, ...rest } = options;
      const sourceValue = source ?? {
        children: [...editor.read.children()],
      };
      const children = [...sourceValue.children];
      const lastBlock = children.at(-1);
      if (
        lastBlock &&
        ElementApi.isElement(lastBlock) &&
        [
          PLUGINS.h1,
          PLUGINS.h2,
          PLUGINS.h3,
          PLUGINS.h4,
          PLUGINS.h5,
          PLUGINS.h6,
        ].some((headingName) => {
          const heading = editor.plugin(headingName);

          return heading.installed && lastBlock.type === heading.schema.type;
        })
      ) {
        const lastText = lastBlock.children.at(-1);

        if (TextApi.isText(lastText)) {
          children[children.length - 1] = {
            ...lastBlock,
            children: [
              ...lastBlock.children.slice(0, -1),
              { text: lastText.text.trimEnd() },
            ],
          };
        }
      }

      let hasLineBreaks = false;
      const escapeLineBreaks = (nodes: readonly Descendant[]): Descendant[] =>
        nodes.map((node) => {
          if (TextApi.isText(node)) {
            if (node.text !== '\n' && node.text.includes('\n')) {
              hasLineBreaks = true;

              return {
                ...node,
                text: node.text.replaceAll('\n', STREAM_LINE_BREAK_PLACEHOLDER),
              };
            }

            return node;
          }

          return ElementApi.isElement(node)
            ? { ...node, children: escapeLineBreaks(node.children) }
            : node;
        });
      const escaped = escapeLineBreaks(children);

      if (
        !escaped.every((node): node is Element => ElementApi.isElement(node))
      ) {
        throw new Error('Markdown documents must contain block elements.');
      }

      let result = editor.api.markdown.serialize({
        ...rest,
        value: { ...sourceValue, children: escaped },
      });
      const trimmedChunk = getChunkTrimmed(chunk);
      const closedChunk = chunk.trimEnd();

      if (isCompleteCodeBlock(result) && !closedChunk.endsWith('```')) {
        result = result.trimEnd().slice(0, -3) + trimmedChunk;
      }
      if (isCompleteMath(result) && !closedChunk.endsWith('$$')) {
        result = result.trimEnd().slice(0, -3) + trimmedChunk;
      }

      result = result
        .replace(/&#x20;/g, ' ')
        .replace(/&#x200B;/g, ' ')
        .replace(/\u200B/g, '');
      if (hasLineBreaks) {
        result = result.replaceAll(STREAM_LINE_BREAK_PLACEHOLDER, '\n');
      }
      if (trimmedChunk.includes('\n') && trimmedChunk !== '\n\n') {
        const trimmedResult = result.trimEnd();

        if (trimmedResult.endsWith('\n<br />')) {
          result = trimmedResult.slice(0, -'<br />'.length);
        } else if (result.endsWith(`${trimmedChunk}\n`)) {
          result = result.slice(0, -`${trimmedChunk}\n`.length);
        }
      }
      if (trimmedChunk !== '\n\n') result = result.trimEnd() + trimmedChunk;
      if (chunk.endsWith('\n\n')) {
        if (result === '\n') result = '';
        else if (result.endsWith('\n\n')) result = result.slice(0, -1);
      }

      return result.replace(/\\([\\`*_{}[\]()#+\-.!~<>|$])/g, '$1');
    };
    const serializeChunkFromState = (
      state: Pick<AIChatPluginReadState, 'children'>,
      options: SerializeMdOptions,
      chunk: string
    ) =>
      serializeChunk(
        options.value
          ? options
          : {
              ...options,
              value: { children: [...state.children()] },
            },
        chunk
      );
    const currentBlockPath = (state: AIChatInsertState) => {
      const anchor = state.nodes.find({
        at: [],
        match: { type: context.schema.type },
      });
      const anchorPrevious =
        anchor && anchor[1].at(-1) !== 0
          ? PathApi.previous(anchor[1])
          : undefined;
      const path = anchorPrevious ??
        state.selection()?.focus.path.slice(0, 1) ?? [0];
      const entry = state.nodes.get<Element>(path);
      const containerTypes = new Set<string>(
        [columnGroup, tablePlugin]
          .filter((plugin) => plugin.installed)
          .map((plugin) => plugin.schema.type)
      );

      return entry && containerTypes.has(entry[0].type)
        ? (state.nodes.above()?.[1] ?? path)
        : path;
    };
    const getInsertStart = (state: AIChatInsertState) => {
      const path = currentBlockPath(state);
      const startBlock = state.nodes.get<Element>(path)?.[0];

      return {
        path,
        startBlock,
        startInEmptyParagraph:
          !!startBlock &&
          NodeApi.string(startBlock).length === 0 &&
          startBlock.type === paragraph.schema.type,
      };
    };
    const withoutSuggestionData = (
      nodes: readonly Descendant[]
    ): Descendant[] =>
      nodes.map((node) => {
        if (TextApi.isText(node)) {
          return node.suggestion || node.comment ? { text: node.text } : node;
        }
        if (!ElementApi.isElement(node)) return node;

        const result = {
          ...node,
          children: withoutSuggestionData(node.children),
        };

        Object.keys(result).forEach((key) => {
          if (
            key === suggestionKey ||
            key === 'suggestionData' ||
            key === SUGGESTION_TRANSIENT_KEY ||
            key.startsWith(`${suggestionKey}_`)
          ) {
            Reflect.deleteProperty(result, key);
          }
        });

        return result;
      });
    const withTransient = (nodes: readonly Descendant[]): Descendant[] =>
      nodes.map((node) =>
        TextApi.isText(node)
          ? { ...node, [SUGGESTION_TRANSIENT_KEY]: true }
          : {
              ...node,
              children: withTransient(node.children),
              [SUGGESTION_TRANSIENT_KEY]: true,
            }
      );
    const diffNodes = (content: string) => {
      const rawChatNodes = context.store.get('chatNodes');
      let chatNodes = withoutSuggestionData(cloneDeep(rawChatNodes));
      const first = chatNodes[0];

      if (
        chatNodes.length === 1 &&
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

        const tableCell = editor.plugin(PLUGINS.tableCell);

        if (
          tableCell.installed &&
          ElementApi.isElement(cell) &&
          cell.type === tableCell.schema.type
        ) {
          chatNodes = [...cell.children];
        }
      }

      const parsed = editor.api.markdown
        .deserialize(content)
        .children.map((node, index) =>
          ElementApi.isElement(node)
            ? {
                ...node,
                ...(chatNodes[index] ?? { id: nanoid() }),
                children: node.children,
              }
            : node
        );

      return withTransient(
        editor.plugin(SuggestionPlugin).api.diff(chatNodes, parsed, {
          ignoreProps: ['id', 'listStart'],
        })
      );
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
      context.store.set({ streaming: false });
      context.store.set({ _blockChunks: '' });
      context.store.set({ _blockPath: null });
      context.store.set({ _mdxName: null });
      context.store.get().chat?.stop?.();
    };
    const resetOptions = () => {
      stop();

      const chat = context.store.get().chat;

      if (chat?.messages.length) chat.clear();

      context.store.set({
        _replaceIds: [],
        chatNodes: [],
        mode: 'insert',
        previewValue: [],
        toolName: null,
      });
    };
    const reset = ({ undo = true }: { undo?: boolean } = {}) => {
      resetOptions();

      if (undo) editor.plugin(BaseAIPlugin).update.undo();
      else editor.plugin(BaseAIPlugin).update.discardPreview();
    };
    const hideOptions = ({ focus = true }: { focus?: boolean } = {}) => {
      resetOptions();
      context.store.set({ open: false });

      if (!focus) return;

      const blockSelection = editor.plugin(BlockSelectionPlugin);

      if (blockSelection.store.get('isSelectingSome')) {
        blockSelection.api.focus();
      } else {
        editor.api.dom.focus();
      }
    };
    const hide = ({
      focus = true,
      undo = true,
    }: {
      focus?: boolean;
      undo?: boolean;
    } = {}) => {
      reset({ undo });
      hideOptions({ focus });
      editor.update({ history: 'skip' }, (tx) => {
        tx.nodes.remove({
          at: [],
          match: { type: context.schema.type },
        });
      });
    };
    const serializeMarkdown = (
      state: AIChatPluginReadState,
      { type }: { type: MarkdownType }
    ) => {
      if (type === 'editor' || type === 'editorWithBlockId') {
        return editor.api.markdown.serialize({
          value: state.value(),
          withBlockId: type === 'editorWithBlockId',
        });
      }
      if (type === 'block' || type === 'blockWithBlockId') {
        const blocks = state.nodes
          .toArray<Element>({
            match: (node) =>
              ElementApi.isElement(node) && state.schema.isBlock(node),
            mode: 'lowest',
          })
          .map(([node]) => node);

        return editor.api.markdown.serialize({
          value: { children: blocks },
          withBlockId: type === 'blockWithBlockId',
        });
      }
      if (type === 'blockSelection' || type === 'blockSelectionWithBlockId') {
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
          throw new Error('Block selections must contain block elements.');
        }

        return editor.api.markdown.serialize({
          value: { children: value },
          withBlockId: type === 'blockSelectionWithBlockId',
        });
      }
      if (type !== 'tableCellWithId') return '';

      if (!tablePlugin.installed) return '';

      const cells = tablePlugin.read.getGridAbove({ format: 'cell' });

      if (cells.length === 0) return '';

      const selectedIds = new Set(
        cells.flatMap(([cell]) =>
          typeof cell.id === 'string' ? [cell.id] : []
        )
      );
      const table = state.nodes.block<Element>({
        match: (node) =>
          ElementApi.isElement(node) && node.type === tablePlugin.schema.type,
      })?.[0];

      if (!table) return '';

      const selectedCells: Array<{ cell: Element; id: string }> = [];
      const rows = table.children.map((row, rowIndex) => {
        if (
          !ElementApi.isElement(row) ||
          row.type !== editor.plugin(PLUGINS.tableRow).schema.type
        ) {
          throw new Error('Tables must contain table rows.');
        }

        const values = row.children.map((cell) => {
          if (
            !ElementApi.isElement(cell) ||
            cell.type !== editor.plugin(PLUGINS.tableCell).schema.type
          ) {
            throw new Error('Table rows must contain table cells.');
          }

          if (typeof cell.id === 'string' && selectedIds.has(cell.id)) {
            selectedCells.push({ cell, id: cell.id });

            return `<CellRef id="${cell.id}" />`;
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
        .map(({ cell, id }) => {
          if (
            !cell.children.every((node): node is Element =>
              ElementApi.isElement(node)
            )
          ) {
            throw new Error('Table cells must contain block elements.');
          }

          return `<Cell id="${id}">\n${editor.api.markdown
            .serialize({ value: { children: cell.children } })
            .trim()}\n</Cell>`;
        })
        .join('\n\n');

      return `${rows.join('\n')}\n\n${cellBlocks}`;
    };
    const getPrompt = (
      state: AIChatPromptState,
      { prompt = '' }: { prompt?: EditorPrompt }
    ) => {
      const params = {
        editor,
        isBlockSelecting: editor
          .plugin(BlockSelectionPlugin)
          .store.get('isSelectingSome'),
        isSelecting: state.blockSelection.isSelecting(),
      };

      if (typeof prompt === 'function') return prompt(params);
      if (typeof prompt === 'string') return prompt;
      if (params.isBlockSelecting && prompt.blockSelecting) {
        return prompt.blockSelecting;
      }
      if (params.isSelecting && prompt.selecting) return prompt.selecting;

      return prompt.default;
    };

    return {
      api: () => ({
        deserializeChunk,
        deserializeInlineChunk,
        hide,
        reload: () => {
          const { chat, chatNodes, chatSelection, toolName } =
            context.store.get();

          context.store.set({ previewValue: [] });
          editor.plugin(BaseAIPlugin).update.undo();
          if (chatSelection) editor.update.selection.set(chatSelection);
          else {
            editor
              .plugin(BlockSelectionPlugin)
              .api.set(chatNodes.map((node) => node.id));
          }

          const blocks = editor.plugin(BlockSelectionPlugin).read.getNodes({});
          const selection = blocks.length
            ? editor.read.ranges.fromEntries(blocks)
            : editor.read.selection();

          void chat?.regenerate({
            body: {
              ctx: {
                children: editor.read.children(),
                selection: selection ?? null,
                toolName,
              },
            },
          });
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

          context.store.set({ previewValue: [] });

          const nextMode =
            mode ??
            (editor.plugin(BlockSelectionPlugin).read.isSelecting()
              ? 'chat'
              : 'insert');

          if (nextMode === 'insert') editor.plugin(BaseAIPlugin).update.undo();

          context.store.set({ mode: nextMode });
          context.store.set({ toolName: nextToolName });

          const blocks = editor.plugin(BlockSelectionPlugin).read.getNodes({});
          const promptText = getPrompt(editor.read, {
            prompt: prompt ?? input,
          });
          const chatSelection = blocks.length ? null : editor.read.selection();
          const selection = blocks.length
            ? editor.read.ranges.fromEntries(blocks)
            : chatSelection;
          const chatNodes = (
            blocks.length
              ? blocks.map(([block]) => block)
              : editor.read.nodes
                  .toArray<IdElement>({
                    match: (node) =>
                      ElementApi.isElement(node) &&
                      typeof node.id === 'string' &&
                      editor.read.schema.isBlock(node),
                    mode: 'highest',
                  })
                  .map(([block]) => block)
          ).filter(
            (node): node is IdElement & { id: string } =>
              typeof node.id === 'string'
          );

          context.store.set({ chatNodes });
          context.store.set({ chatSelection });

          void chat?.sendMessage(promptText, {
            body: {
              ctx: {
                children: [...editor.read.children()],
                selection: selection ?? null,
                toolName: nextToolName,
              },
            },
            ...options,
          });
        },
      }),
      read: ({ state }) => ({
        commentRange: (comment: TComment) => {
          const nodes = editor.api.markdown.deserialize(
            comment.content
          ).children;
          let firstBlock: NodeEntry<Element> | undefined;
          const ranges: Range[] = [];

          nodes.forEach((node, index) => {
            const block =
              index === 0
                ? state.nodes.find<Element>({
                    at: [],
                    match: { id: comment.blockId },
                  })
                : firstBlock
                  ? state.nodes.get<Element>([firstBlock[1][0] + index])
                  : undefined;

            if (index === 0) firstBlock = block;
            if (!block) return;

            const range = context.editor
              .plugin(BaseAIPlugin)
              .api.findTextRangeInBlock({
                block,
                findText: NodeApi.string(node),
              });

            if (range) ranges.push(range);
          });

          const first = ranges[0];
          const last = ranges.at(-1);

          if (!first || !last) return;

          return { anchor: first.anchor, focus: last.focus };
        },
        insertStart: getInsertStart.bind(null, state),
        markdown: serializeMarkdown.bind(null, state),
        node: (
          options: EditorNodesOptions<Node> & {
            anchor?: boolean;
            streaming?: boolean;
          } = {}
        ) => {
          const { anchor = false, streaming = false, ...rest } = options;

          if (anchor) {
            return state.nodes.find<Node>({
              at: [],
              match: { type: context.schema.type },
              ...rest,
            });
          }
          if (streaming) {
            const path = context.store.get('_blockPath');

            if (!context.store.get('streaming') || !path) return;

            return state.nodes.find<Node>({
              at: path,
              match: (node) => Boolean(Reflect.get(node, ai.schema.key)),
              mode: 'lowest',
              reverse: true,
              ...rest,
            });
          }

          return state.nodes.find<Node>({
            match: (node) => Boolean(Reflect.get(node, ai.schema.key)),
            ...rest,
          });
        },
        prompt: getPrompt.bind(null, state),
        resolvePlaceholders: (
          text: string,
          { prompt }: { prompt?: string } = {}
        ) => {
          let result = text.split('{prompt}').join(prompt ?? '');
          const placeholders: Record<string, MarkdownType> = {
            '{blockSelectionWithBlockId}': 'blockSelectionWithBlockId',
            '{blockSelection}': 'blockSelection',
            '{blockWithBlockId}': 'blockWithBlockId',
            '{block}': 'block',
            '{editorWithBlockId}': 'editorWithBlockId',
            '{editor}': 'editor',
            '{tableCellWithId}': 'tableCellWithId',
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
        serializeChunk: serializeChunkFromState.bind(null, state),
      }),
      selectors: {
        lastAssistantMessage: (state) =>
          state.chat?.messages.findLast(
            (message) => message.role === 'assistant'
          ),
      },
      update: ({ context: updateContext, tx }) => {
        const getPreviewSource = () => {
          const source = [...context.store.get('previewValue')];

          if (
            source.length === 0 ||
            source.every((node) => editor.read.nodes.isEmpty(node))
          ) {
            return;
          }

          return source;
        };
        const insertChunk = (
          chunk: string,
          options: StreamInsertOptions = {}
        ) => {
          const hasPreview = tx.ai.hasPreview();

          if (hasPreview) tx.history.skip();

          const insertOptions = hasPreview
            ? {
                ...options,
                elementProps: {
                  ...options.elementProps,
                  [AI_PREVIEW_KEY]: true,
                },
              }
            : options;
          const { _blockChunks, _blockPath } = context.store.get();

          if (_blockPath === null) {
            const blocks = deserializeChunk(chunk);
            const { path, startInEmptyParagraph } = getInsertStart(tx);

            if (blocks.length === 0) return;

            const insertPath = startInEmptyParagraph
              ? path
              : PathApi.next(path);
            const insertedBlocks = withNodeProps(blocks, insertOptions);

            const insert = () => {
              if (startInEmptyParagraph) {
                tx.nodes.replace(insertedBlocks, { at: path, select: true });
              } else {
                tx.blocks.insertAfter(insertedBlocks, {
                  at: path,
                  select: true,
                });
              }
            };

            if (options.autoScroll) tx.dom.autoScroll(insert);
            else insert();

            let lastPath = insertPath;

            for (let index = 1; index < blocks.length; index++) {
              lastPath = PathApi.next(lastPath);
            }

            const lastBlock = tx.nodes.get<Element>(lastPath);

            if (!lastBlock) return;

            updateContext.afterCommit(() => {
              context.store.set({
                _blockChunks:
                  blocks.length > 1
                    ? serializeChunk(
                        { value: { children: [lastBlock[0]] } },
                        chunk
                      )
                    : chunk,
                _blockPath: lastPath,
              });
            });

            return;
          }

          const combined = _blockChunks + chunk;
          const blocks = deserializeChunk(combined);

          if (blocks.length === 0) {
            console.warn(
              `Unsupported Markdown nodes: ${JSON.stringify(combined)}`
            );

            return;
          }

          let nextChunks = _blockChunks;
          let nextPath = _blockPath;

          const update = () => {
            if (blocks.length === 1) {
              const current = tx.nodes.get<Element>(_blockPath)?.[0];

              if (!current) return;

              if (isSameNode(current, blocks[0])) {
                const end = tx.points.end(_blockPath);

                if (!end) return;

                tx.nodes.insert(
                  withNodeProps(deserializeInlineChunk(chunk), insertOptions),
                  { at: end, select: true }
                );

                const updated = tx.nodes.get<Element>(_blockPath);

                if (!updated) return;

                const serialized = serializeChunk(
                  { value: { children: [updated[0]] } },
                  combined
                );

                if (
                  serialized === combined &&
                  NodeApi.string(blocks[0]) === serialized
                ) {
                  nextChunks = combined;
                } else {
                  tx.nodes.replace(withNodeProps(blocks, insertOptions), {
                    at: _blockPath,
                    select: true,
                  });
                  const replacement = serializeChunk(
                    { value: { children: blocks } },
                    combined
                  );
                  const preserveChunkTypes = new Set<string>(
                    [codeBlock, tablePlugin, equation]
                      .filter((plugin) => plugin.installed)
                      .map((plugin) => plugin.schema.type)
                  );

                  nextChunks = preserveChunkTypes.has(blocks[0].type)
                    ? combined
                    : replacement;
                }
              } else {
                nextChunks = serializeChunk(
                  { value: { children: blocks } },
                  combined
                );
                tx.nodes.replace(withNodeProps(blocks, insertOptions), {
                  at: _blockPath,
                  select: true,
                });
              }

              return;
            }

            tx.nodes.replace(withNodeProps(blocks, insertOptions), {
              at: _blockPath,
              select: true,
            });
            nextPath = _blockPath;
            for (let index = 1; index < blocks.length; index++) {
              nextPath = PathApi.next(nextPath);
            }

            const end = tx.nodes.get<Element>(nextPath);

            if (end) {
              nextChunks = serializeChunk(
                { value: { children: [end[0]] } },
                combined
              );
            }
          };

          if (options.autoScroll) tx.dom.autoScroll(update);
          else update();

          updateContext.afterCommit(() => {
            context.store.set({
              _blockChunks: nextChunks,
              _blockPath: nextPath,
            });
          });
        };
        const reviewSuggestions = (action: 'accept' | 'reject') => {
          const suggestion = editor.plugin(SuggestionPlugin);

          tx.suggestion.nodes({ transient: true }).forEach(([node]) => {
            const data = suggestion.api.suggestionData(node);

            if (!data) return;

            tx.suggestion[action]({
              createdAt: new Date(data.createdAt),
              keyId: suggestion.api.key(data.id),
              suggestionId: data.id,
              type: data.type,
              userId: data.userId,
            });
          });
          tx.suggestion.clearTransient({
            at: [],
            mode: 'all',
            match: (node) =>
              Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY)),
          });
        };
        const applySuggestions = (
          content: string,
          _options: { split?: boolean } = {}
        ) => {
          editor.plugin(CursorOverlayPlugin).api.removeCursor('selection');

          const chatNodes = context.store.get('chatNodes');
          const nextNodes = diffNodes(content);

          if (chatNodes.length <= 1) {
            tx.ai.markBatch();
            tx.fragment.replace(nextNodes);

            const range = tx.ranges.fromEntries(
              tx.nodes.toArray({
                at: [],
                mode: 'lowest',
                match: (node) =>
                  TextApi.isText(node) && !!node[SUGGESTION_TRANSIENT_KEY],
              })
            );

            if (range) tx.selection.set(range);

            return;
          }

          if (context.store.get('_replaceIds').length === 0) {
            context.store.set({
              _replaceIds: chatNodes.map((node) => node.id),
            });
          }

          const replaceNodes = tx.nodes.toArray<Element>({
            at: [],
            match: (node) =>
              ElementApi.isElement(node) &&
              typeof node.id === 'string' &&
              context.store.get('_replaceIds').includes(node.id),
          });
          const suggestion = editor.plugin(SuggestionPlugin).api;
          const groups: {
            at: number[];
            children: Descendant[];
            count: number;
            index: number;
          }[] = [];

          replaceNodes.forEach(([node, path], index) => {
            const next = nextNodes[index];
            let replacement: Descendant[] = [];

            if (next) {
              const candidates =
                index === replaceNodes.length - 1 &&
                nextNodes.length > replaceNodes.length
                  ? nextNodes.slice(index)
                  : [next];
              replacement =
                candidates.length === 1 &&
                suggestion.skipDeletes(node) === suggestion.skipDeletes(next) &&
                ElementApi.isElement(next) &&
                suggestion.suggestionData(node)?.type ===
                  suggestion.suggestionData(next)?.type &&
                node.id === next.id
                  ? [node]
                  : candidates;
            }

            const at = path.slice(0, -1);
            const childIndex = path.at(-1);

            if (childIndex === undefined) return;

            const previous = groups.at(-1);

            if (
              previous &&
              PathApi.equals(previous.at, at) &&
              childIndex === previous.index + previous.count
            ) {
              previous.children.push(...replacement);
              previous.count++;
            } else {
              groups.push({
                at,
                children: replacement,
                count: 1,
                index: childIndex,
              });
            }
          });

          tx.ai.markBatch();
          groups.toReversed().forEach((group) => {
            tx.nodes.replaceChildren(group.children, group);
          });

          const ids = nextNodes.flatMap((node) =>
            ElementApi.isElement(node) && typeof node.id === 'string'
              ? [node.id]
              : []
          );

          updateContext.afterCommit(() => {
            editor.plugin(BlockSelectionPlugin).api.set(ids);
            context.store.set({ _replaceIds: ids });
          });
        };
        const applyTableCellSuggestion = ({ content, id }: TableCellUpdate) => {
          const entry = tx.nodes.find<Element>({
            at: [],
            match: { id },
          });

          if (!entry) {
            console.warn(`Table cell with id "${id}" not found`);

            return;
          }

          const [cell, path] = entry;
          const next = withTransient(
            editor
              .plugin(SuggestionPlugin)
              .api.diff(
                withoutSuggestionData(cell.children),
                editor.api.markdown.deserialize(content).children,
                { ignoreProps: ['id'] }
              )
          );

          tx.ai.markBatch();
          tx.nodes.replaceChildren(next, { at: path });
        };
        const getSelectedBlocks = () => {
          const selectedIds = editor
            .plugin(BlockSelectionPlugin)
            .store.get('selectedIds');

          if (!selectedIds?.size) return [];

          return tx.nodes.toArray<IdElement>({
            at: [],
            match: (node) =>
              ElementApi.isElement(node) &&
              typeof node.id === 'string' &&
              selectedIds.has(node.id),
          });
        };

        return {
          accept: () => {
            if (context.store.get('mode') === 'insert') {
              let focus: ReturnType<typeof tx.points.end>;

              tx.children().forEach((node, index) => {
                if (ElementApi.isElement(node) && node[AI_PREVIEW_KEY]) {
                  focus = tx.points.end([index]);
                }
              });

              const acceptedPreview = tx.ai.acceptPreview();

              if (!acceptedPreview) {
                tx.ai.markBatch();
                tx.ai.clearPreviewNodes({
                  at: [],
                  match: (node) =>
                    ElementApi.isElement(node) && !!node[AI_PREVIEW_KEY],
                });
                tx.ai.removeMarks();
                tx.nodes.remove({
                  at: [],
                  match: { type: context.schema.type },
                });
              }

              if (!acceptedPreview && focus) {
                tx.selection.set({ anchor: focus, focus });
              }
              updateContext.afterCommit(() => hideOptions());
            } else {
              reviewSuggestions('accept');
              tx.nodes.remove({
                at: [],
                match: { type: context.schema.type },
              });
              updateContext.afterCommit(() => hideOptions());
            }
          },
          acceptSuggestions: () => reviewSuggestions('accept'),
          applySuggestions,
          applyTableCellSuggestion,
          insertBelow: ({
            format = 'single',
          }: {
            format?: 'all' | 'none' | 'single';
          } = {}) => {
            const blockSelection = editor.plugin(BlockSelectionPlugin);

            if (context.store.get('toolName') !== 'generate') {
              const selected = getSelectedBlocks();
              const selectedIds = blockSelection.store.get('selectedIds');
              const nodes = cloneDeep(selected.map(([node]) => node));

              tx.ai.undo();

              if (!selectedIds || selectedIds.size === 0) return;

              const last = getSelectedBlocks().at(-1);

              if (!last) return;

              tx.blockSelection.insertBlocksAndSelect(nodes, {
                at: PathApi.next(last[1]),
              });
              reviewSuggestions('accept');
              tx.nodes.remove({
                at: [],
                match: { type: context.schema.type },
              });
              updateContext.afterCommit(() => hideOptions({ focus: false }));

              return;
            }

            const source = getPreviewSource();

            if (!source) return;

            const isBlockSelecting =
              blockSelection.store.get('isSelectingSome');

            tx.ai.undo();
            tx.nodes.remove({
              at: [],
              match: { type: context.schema.type },
            });
            updateContext.afterCommit(() => hideOptions());

            if (isBlockSelecting) {
              const selected = getSelectedBlocks();
              const selectedIds = blockSelection.store.get('selectedIds');

              if (!selectedIds || selectedIds.size === 0) return;

              const last = selected.at(-1);

              if (!last) return;

              const blocks =
                format === 'none'
                  ? cloneDeep(source)
                  : createFormattedBlocks({
                      blocks: cloneDeep(source),
                      format,
                      sourceBlock: last,
                    });

              if (!blocks) return;

              tx.blockSelection.insertBlocksAndSelect(blocks, {
                at: PathApi.next(last[1]),
              });

              return;
            }

            const selection = tx.selection();

            if (!selection) return;

            const edges = tx.ranges.edges(selection);

            if (!edges) return;

            const [, end] = edges;
            const endPath = [end.path[0]];
            const current = tx.nodes.block({ at: endPath });

            if (!current) return;

            const blocks =
              format === 'none'
                ? cloneDeep(source)
                : createFormattedBlocks({
                    blocks: cloneDeep(source),
                    format,
                    sourceBlock: current,
                  });

            if (!blocks) return;

            tx.blockSelection.insertBlocksAndSelect(blocks, {
              at: PathApi.next(endPath),
            });
          },
          insertChunk,
          rejectSuggestions: () => reviewSuggestions('reject'),
          replaceSelection: ({
            format = 'single',
          }: {
            format?: 'all' | 'none' | 'single';
          } = {}) => {
            const source = getPreviewSource();

            if (!source) return;

            tx.ai.undo();
            tx.nodes.remove({
              at: [],
              match: { type: context.schema.type },
            });
            updateContext.afterCommit(() => hideOptions());

            const blockSelection = editor.plugin(BlockSelectionPlugin);

            if (!blockSelection.store.get('isSelectingSome')) {
              const block = tx.nodes.block();

              if (
                block &&
                tx.selection.contains(block[1]) &&
                format !== 'none'
              ) {
                const blocks = createFormattedBlocks({
                  blocks: cloneDeep(source),
                  format,
                  sourceBlock: block,
                });

                if (!blocks) return;

                const codeLine = editor.plugin(PLUGINS.codeLine);

                if (
                  codeLine.installed &&
                  codeBlock.installed &&
                  block[0].type === codeLine.schema.type &&
                  source[0].type === codeBlock.schema.type &&
                  source.length === 1
                ) {
                  tx.fragment.replace(blocks[0].children);
                } else {
                  tx.fragment.replace(blocks);
                }
              } else {
                tx.fragment.replace(source);
              }

              return;
            }

            const selected = getSelectedBlocks();

            if (selected.length === 0) return;

            const blocks =
              format === 'none' || (format === 'single' && selected.length > 1)
                ? cloneDeep(source)
                : createFormattedBlocks({
                    blocks: cloneDeep(source),
                    format,
                    sourceBlock: selected[0],
                  });

            if (!blocks) return;

            tx.blockSelection.removeNodes();
            tx.blockSelection.insertBlocksAndSelect(blocks, {
              at: selected[0][1],
            });
          },
        };
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
    corrections: [
      {
        event: 'content',
        correct({ entry: [node, path], tx }) {
          const aiKey = context.editor.plugin(BaseAIPlugin).schema.key;

          if (Reflect.get(node, aiKey) && !context.store.get('open')) {
            tx.nodes.unset('ai', {
              at: path,
              match: (candidate) => Boolean(Reflect.get(candidate, aiKey)),
            });
          } else if (
            ElementApi.isElement(node) &&
            node.type === context.schema.type &&
            !context.store.get('open')
          ) {
            tx.nodes.remove({ at: path });
          }
        },
      },
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
