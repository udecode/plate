import type { UseChatHelpers } from '@ai-sdk/react';
import type { TriggerComboboxPluginOptions } from '@platejs/combobox';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import {
  type EditorNodesOptions,
  type NodeEntry,
  type OmitFirst,
  type Path,
  type PluginConfig,
  type SlateEditor,
  bindFirst,
  ElementApi,
  getPluginType,
  KEYS,
} from 'platejs';
import { createTPlatePlugin } from 'platejs/react';

import type { AIBatch } from '../../lib';
import type { AIMode, AIToolName } from '../../lib/types';
import type { ChatMessage } from './internal/types';

import { AIPlugin } from '../ai/AIPlugin';
import { removeAnchorAIChat } from './transforms';
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
    /** @private The Editor used to generate the AI response. */
    aiEditor: SlateEditor | null;
    chat: UseChatHelpers<ChatMessage>;
    /** @deprecated Use api.aiChat.node({streaming:true}) instead */
    experimental_lastTextId: string | null;
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
      reset: OmitFirst<typeof resetAIChat>;
      submit: OmitFirst<typeof submitAIChat>;
      hide: () => void;
      node: (
        options?: EditorNodesOptions & { anchor?: boolean; streaming?: boolean }
      ) => NodeEntry | undefined;
      reload: () => void;
      show: () => void;
      stop: () => void;
    };
  },
  {
    aiChat: {
      accept: OmitFirst<typeof acceptAIChat>;
      insertBelow: OmitFirst<typeof insertBelowAIChat>;
      replaceSelection: OmitFirst<typeof replaceSelectionAIChat>;
      removeAnchor: (options?: EditorNodesOptions) => void;
    };
  }
>;

export const AIChatPlugin = createTPlatePlugin<AIChatPluginConfig>({
  key: KEYS.aiChat,
  dependencies: ['ai'],
  node: {
    isElement: true,
  },
  options: {
    _blockChunks: '',
    _blockPath: null,
    _mdxName: null,
    aiEditor: null,
    chat: { messages: [] } as unknown as UseChatHelpers<ChatMessage>,
    experimental_lastTextId: null,
    mode: 'insert',
    open: false,
    streaming: false,
    toolName: null,
    trigger: ' ',
    triggerPreviousCharPattern: /^\s?$/,
  },
})
  .overrideEditor(withAIChat)
  .extendApi<
    Pick<
      AIChatPluginConfig['api']['aiChat'],
      'node' | 'reset' | 'stop' | 'submit'
    >
  >(({ editor, getOption, getOptions, setOption, type }) => {
    return {
      reset: bindFirst(resetAIChat, editor),
      submit: bindFirst(submitAIChat, editor),
      node: (options = {}) => {
        const { anchor = false, streaming = false, ...rest } = options;

        if (anchor) {
          return editor.api.node({
            at: [],
            match: (n) => ElementApi.isElement(n) && n.type === type,
            ...rest,
          });
        }

        if (streaming) {
          if (!getOption('streaming')) return;

          const path = getOption('_blockPath');
          if (!path) return;

          return editor.api.node({
            at: path,
            mode: 'lowest',
            reverse: true,
            match: (t) => !!t[getPluginType(editor, KEYS.ai)],
            ...rest,
          });
        }

        return editor.api.node({
          match: (n) => n[getPluginType(editor, KEYS.ai)],
          ...rest,
        });
      },
      reload: () => {
        const { chat, mode } = getOptions();

        if (mode === 'insert') {
          editor.getTransforms(AIPlugin).ai.undo();
        }

        void chat.regenerate?.();
      },
      stop: () => {
        setOption('streaming', false);
        getOptions().chat.stop?.();
      },
    };
  })
  .extendApi(({ api, editor, getOptions, setOption, tf, type }) => ({
    hide: () => {
      api.aiChat.reset();

      setOption('open', false);

      if (editor.getOption(BlockSelectionPlugin, 'isSelectingSome')) {
        // TODO
        // editor.getApi(BlockSelectionPlugin).blockSelection.focus();
      } else {
        editor.tf.focus();
      }

      const lastBatch = editor.history.undos.at(-1) as AIBatch;

      if (lastBatch?.ai) {
        delete lastBatch.ai;
      }

      tf.aiChat.removeAnchor();
    },
    show: () => {
      api.aiChat.reset();

      getOptions().chat.setMessages?.([]);

      setOption('open', true);
    },
  }))
  .extendTransforms(({ editor }) => ({
    accept: bindFirst(acceptAIChat, editor),
    insertBelow: bindFirst(insertBelowAIChat, editor),
    removeAnchor: bindFirst(removeAnchorAIChat, editor),
    replaceSelection: bindFirst(replaceSelectionAIChat, editor),
  }));
