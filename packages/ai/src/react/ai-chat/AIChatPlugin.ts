import type { TriggerComboboxPluginOptions } from '@udecode/plate-combobox';
import type { UseChatHelpers } from 'ai/react';

import {
  type EditorNodesOptions,
  type NodeEntry,
  type OmitFirst,
  type Path,
  type PluginConfig,
  type SlateEditor,
  bindFirst,
  ElementApi,
} from '@udecode/plate';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { createTPlatePlugin } from '@udecode/plate/react';

import type { AIBatch } from '../../lib';

import { AIPlugin } from '../ai/AIPlugin';
import { removeAnchorAIChat } from './transforms';
import { acceptAIChat } from './transforms/acceptAIChat';
import { insertBelowAIChat } from './transforms/insertBelowAIChat';
import { replaceSelectionAIChat } from './transforms/replaceSelectionAIChat';
import { useAIChatHooks } from './useAIChatHook';
import {
  type EditorPromptParams,
  getEditorPrompt,
} from './utils/getEditorPrompt';
import { resetAIChat } from './utils/resetAIChat';
import { submitAIChat } from './utils/submitAIChat';
import { withAIChat } from './withAIChat';

export type AIChatPluginConfig = PluginConfig<
  'aiChat',
  {
    /** @private Using For streamInsertChunk */
    _blockChunks: string;
    _blockPath: Path | null;
    /** @private The Editor used to generate the AI response. */
    aiEditor: SlateEditor | null;
    chat: Partial<UseChatHelpers>;
    /** @deprecated Use api.aiChat.node({streaming:true}) instead */
    experimental_lastTextId: string | null;
    /**
     * Specifies how the assistant message is handled:
     *
     * - 'insert': Directly inserts content into the editor without preview.
     * - 'chat': Initiates an interactive session to review and refine content
     *   before insertion.
     */
    mode: 'chat' | 'insert';
    open: boolean;
    /** Whether the AI response is currently streaming. Cursor mode only. */
    streaming: boolean;
    /**
     * Template function for generating the user prompt. Supports the following
     * placeholders:
     *
     * - {block}: Replaced with the markdown of the blocks in selection.
     * - {editor}: Replaced with the markdown of the entire editor content.
     * - {selection}: Replaced with the markdown of the current selection.
     * - {prompt}: Replaced with the actual user prompt.
     */
    promptTemplate: (props: EditorPromptParams) => string;
    /**
     * Template function for generating the system message. Supports the same
     * placeholders as `promptTemplate`.
     */
    systemTemplate: (props: EditorPromptParams) => string | void;
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
  key: 'aiChat',
  dependencies: ['ai'],
  node: {
    isElement: true,
  },
  options: {
    _blockChunks: '',
    _blockPath: null,
    aiEditor: null,
    chat: { messages: [] } as any,
    experimental_lastTextId: null,
    mode: 'chat',
    open: false,
    streaming: false,
    trigger: ' ',
    triggerPreviousCharPattern: /^\s?$/,
    promptTemplate: () => '{prompt}',
    systemTemplate: () => {},
  },
  useHooks: useAIChatHooks,
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
            match: (t) => !!t.ai,
            ...rest,
          });
        }

        return editor.api.node({
          match: (n) => n.ai,
          ...rest,
        });
      },
      reload: () => {
        const { chat, mode } = getOptions();

        if (mode === 'insert') {
          editor.getTransforms(AIPlugin).ai.undo();
        }

        void chat.reload?.({
          body: {
            system: getEditorPrompt(editor, {
              promptTemplate: getOptions().systemTemplate,
            }),
          },
        });
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
