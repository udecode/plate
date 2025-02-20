import type { TriggerComboboxPluginOptions } from '@udecode/plate-combobox';
import type { UseChatHelpers } from 'ai/react';

import {
  type OmitFirst,
  type PluginConfig,
  type SlateEditor,
  bindFirst,
} from '@udecode/plate';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { createTPlatePlugin } from '@udecode/plate/react';

import type { AIBatch } from '../../lib';

import { AIPlugin } from '../ai/AIPlugin';
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
    /** @private The Editor used to generate the AI response. */
    aiEditor: SlateEditor | null;
    chat: Partial<UseChatHelpers>;
    /**
     * Specifies how the assistant message is handled:
     *
     * - 'insert': Directly inserts content into the editor without preview.
     * - 'chat': Initiates an interactive session to review and refine content
     *   before insertion.
     */
    mode: 'chat' | 'insert';
    open: boolean;
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
    };
  }
>;

export const AIChatPlugin = createTPlatePlugin<AIChatPluginConfig>({
  key: 'aiChat',
  dependencies: ['ai'],
  options: {
    aiEditor: null,
    chat: { messages: [] } as any,
    mode: 'chat',
    open: false,
    trigger: ' ',
    triggerPreviousCharPattern: /^\s?$/,
    promptTemplate: () => '{prompt}',
    systemTemplate: () => {},
  },
})
  .overrideEditor(withAIChat)
  .extend(() => ({
    useHooks: useAIChatHooks,
  }))
  .extendApi<
    Pick<AIChatPluginConfig['api']['aiChat'], 'reset' | 'stop' | 'submit'>
  >(({ editor, getOptions }) => {
    return {
      reset: bindFirst(resetAIChat, editor),
      submit: bindFirst(submitAIChat, editor),
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
        getOptions().chat.stop?.();
      },
    };
  })
  .extendApi(({ api, editor, getOptions, setOption }) => ({
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
    replaceSelection: bindFirst(replaceSelectionAIChat, editor),
  }));
