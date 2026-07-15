import type { UseChatHelpers } from '@ai-sdk/react';
import type { TriggerComboboxPluginOptions } from '@platejs/combobox';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import type {
  EditorNodesOptions,
  Node,
  NodeEntry,
  Path,
  Range,
} from '@platejs/plite';
import type { OmitFirst } from '@udecode/utils';
import { type PluginConfig, getPluginType } from '@platejs/core';
import { type TIdElement, KEYS } from '@platejs/utils';
import { type PlateEditor, createPlatePlugin } from '@platejs/core/react';

import { BaseAIPlugin } from '../../lib/BaseAIPlugin';
import type { AIMode, AIToolName } from '../../lib/types';
import type { ChatMessage } from './internal/types';

import {
  type RemoveAnchorAIChatOptions,
  removeAnchorAIChat,
} from './transforms';
import { acceptAIChat } from './transforms/acceptAIChat';
import { insertBelowAIChat } from './transforms/insertBelowAIChat';
import { replaceSelectionAIChat } from './transforms/replaceSelectionAIChat';
import { resetAIChat } from './utils/resetAIChat';
import { submitAIChat } from './utils/submitAIChat';
import { withAIChat } from './withAIChat';

export type AIChatPluginConfig = PluginConfig<
  'aiChat',
  {
    _blockChunks: string;
    _blockPath: Path | null;
    /** @private Using For streamInsertChunk */
    _mdxName: string | null;
    _replaceIds: string[];
    /** @private The Editor used to generate the AI response. */
    aiEditor: PlateEditor | null;
    chat: UseChatHelpers<ChatMessage> | null;
    chatNodes: TIdElement[];
    chatSelection: Range | null;
    /**
     * Specifies how the assistant message is handled:
     *
     * - 'insert': Directly inserts content into the editor without preview.
     * - 'chat': Initiates an interactive session to review and refine content
     *   before insertion.
     */
    mode: AIMode;
    open: boolean;
    /** Whether the AI response is currently streaming. Cursor mode only. */
    streaming: boolean;
    toolName: AIToolName;
  } & TriggerComboboxPluginOptions,
  {
    aiChat: {
      accept: OmitFirst<typeof acceptAIChat>;
      reset: OmitFirst<typeof resetAIChat>;
      submit: OmitFirst<typeof submitAIChat>;
      hide: (options?: { focus?: boolean; undo?: boolean }) => void;
      insertBelow: OmitFirst<typeof insertBelowAIChat>;
      node: (
        options?: EditorNodesOptions<Node> & {
          anchor?: boolean;
          streaming?: boolean;
        }
      ) => NodeEntry<Node> | undefined;
      reload: () => void;
      replaceSelection: OmitFirst<typeof replaceSelectionAIChat>;
      show: () => void;
      stop: () => void;
    };
  },
  {
    aiChat: {
      removeAnchor: (options?: RemoveAnchorAIChatOptions) => void;
    };
  }
>;

export const AIChatPlugin = createPlatePlugin<AIChatPluginConfig>({
  key: KEYS.aiChat,
  dependencies: ['ai'],
  node: {
    isElement: true,
  },
  options: {
    _blockChunks: '',
    _blockPath: null,
    _mdxName: null,
    _replaceIds: [],
    aiEditor: null,
    chat: null,
    chatNodes: [],
    chatSelection: null,
    mode: 'insert',
    open: false,
    streaming: false,
    toolName: null,
    trigger: ' ',
    triggerPreviousCharPattern: /^\s?$/,
  },
})
  .extendExtension(withAIChat)
  .extendApi<AIChatPluginConfig['api']['aiChat']>(
    ({ editor, getOption, getOptions, setOption, type }) => ({
      accept: () => acceptAIChat(editor),
      hide: ({ focus = true, undo = true } = {}) => {
        resetAIChat(editor, { undo });
        setOption('open', false);

        if (focus) {
          if (
            editor.plugin(BlockSelectionPlugin).getOption('isSelectingSome')
          ) {
            editor.plugin(BlockSelectionPlugin).api.focus();
          } else {
            editor.api.dom.focus();
          }
        }

        editor.update((tx) => {
          tx.history.skip();
          tx.aiChat.removeAnchor();
        });
      },
      insertBelow: (sourceEditor, options) =>
        insertBelowAIChat(editor, sourceEditor, options),
      node: (options = {}) => {
        const { anchor = false, streaming = false, ...rest } = options;

        if (anchor) {
          return editor.read.nodes.find<Node>({
            at: [],
            match: { type },
            ...rest,
          });
        }

        const aiType = getPluginType(editor, KEYS.ai);

        if (streaming) {
          if (!getOption('streaming')) return;

          const path = getOption('_blockPath');
          if (!path) return;

          return editor.read.nodes.find<Node>({
            at: path,
            mode: 'lowest',
            reverse: true,
            match: (node) => Boolean(Reflect.get(node, aiType)),
            ...rest,
          });
        }

        return editor.read.nodes.find<Node>({
          match: (node) => Boolean(Reflect.get(node, aiType)),
          ...rest,
        });
      },
      reload: () => {
        const { chat, chatNodes, chatSelection } = getOptions();

        editor.plugin(BaseAIPlugin).api.undo();

        if (chatSelection) {
          editor.update.selection.set(chatSelection);
        } else {
          editor
            .plugin(BlockSelectionPlugin)
            .api.set(chatNodes.map((node) => node.id));
        }

        const blocks = editor.plugin(BlockSelectionPlugin).api.getNodes({});
        const selection =
          blocks.length > 0
            ? editor.read.ranges.fromEntries(blocks)
            : editor.read.selection();

        void chat?.regenerate?.({
          body: {
            ctx: {
              children: editor.read.children(),
              selection: selection ?? null,
              toolName: getOption('toolName'),
            },
          },
        });
      },
      replaceSelection: (sourceEditor, options) =>
        replaceSelectionAIChat(editor, sourceEditor, options),
      reset: (options) => resetAIChat(editor, options),
      show: () => {
        resetAIChat(editor);
        setOption('toolName', null);
        getOptions().chat?.setMessages?.([]);
        setOption('open', true);
      },
      stop: () => {
        setOption('streaming', false);
        setOption('_blockChunks', '');
        setOption('_blockPath', null);
        setOption('_mdxName', null);
        getOptions().chat?.stop?.();
      },
      submit: (input, options) => submitAIChat(editor, input, options),
    })
  )
  .extendTx(({ editor }) => (tx) => ({
    removeAnchor: (options) => removeAnchorAIChat(editor, tx, options),
  }));
