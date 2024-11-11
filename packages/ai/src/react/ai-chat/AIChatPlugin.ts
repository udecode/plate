import type { TriggerComboboxPluginOptions } from '@udecode/plate-combobox';
import type { UseChatHelpers } from 'ai/react';

import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
} from '@udecode/plate-common';
import {
  type PlateEditor,
  createPlateEditor,
  createTPlatePlugin,
  focusEditor,
} from '@udecode/plate-common/react';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';

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

export type AIChatOptions = {
  chat: Partial<UseChatHelpers>;
  createAIEditor: () => PlateEditor;
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
} & TriggerComboboxPluginOptions;

export type AIChatApi = {
  hide: () => void;
  reload: () => void;
  reset: OmitFirst<typeof resetAIChat>;
  show: () => void;
  stop: () => void;
  submit: OmitFirst<typeof submitAIChat>;
};

export type AIChatTransforms = {
  accept: OmitFirst<typeof acceptAIChat>;
  insertBelow: OmitFirst<typeof insertBelowAIChat>;
  replaceSelection: OmitFirst<typeof replaceSelectionAIChat>;
};

export type AIChatPluginConfig = PluginConfig<
  'aiChat',
  AIChatOptions,
  { aiChat: AIChatApi },
  { aiChat: AIChatTransforms }
>;

export const AIChatPlugin = createTPlatePlugin<AIChatPluginConfig>({
  key: 'aiChat',
  dependencies: ['ai'],
  extendEditor: withAIChat,
  options: {
    chat: { messages: [] } as any,
    createAIEditor: () =>
      createPlateEditor({
        id: 'ai',
      }),
    mode: 'chat',
    open: false,
    promptTemplate: () => '{prompt}',
    systemTemplate: () => {},
    trigger: ' ',
    triggerPreviousCharPattern: /^\s?$/,
  },
})
  .extend(() => ({
    useHooks: useAIChatHooks,
  }))
  .extendApi<Pick<AIChatApi, 'reset' | 'stop' | 'submit'>>(
    ({ editor, getOptions }) => {
      return {
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
        reset: bindFirst(resetAIChat, editor),
        stop: () => {
          getOptions().chat.stop?.();
        },
        submit: bindFirst(submitAIChat, editor),
      };
    }
  )
  .extendApi(({ api, editor, getOptions, setOption }) => ({
    hide: () => {
      api.aiChat.reset();

      setOption('open', false);

      if (editor.getOption(BlockSelectionPlugin, 'isSelectingSome')) {
        // TODO
        // editor.getApi(BlockSelectionPlugin).blockSelection.focus();
      } else {
        focusEditor(editor);
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
