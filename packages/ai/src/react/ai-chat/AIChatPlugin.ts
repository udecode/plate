import type { TriggerComboboxPluginOptions } from '@udecode/plate-combobox';
import type { UseChatHelpers } from 'ai/react';

import {
  type OmitFirst,
  type PluginConfig,
  bindFirst,
  someNode,
  withMerging,
} from '@udecode/plate-common';
import {
  type PlateEditor,
  createPlateEditor,
  createTPlatePlugin,
} from '@udecode/plate-common/react';

import { AIPlugin } from '../ai/AIPlugin';
import {
  type EditorPrompt,
  type EditorPromptParams,
  getEditorPrompt,
} from '../ai/utils/getEditorPrompt';
import {
  acceptAIChat,
  insertBelowAIChat,
  replaceSelectionAIChat,
} from './transforms/acceptAIChat';
import { useAIChatHooks } from './useAIChatHook';
import { withTriggerAIChat } from './withTriggerAIChat';

export type AIChatOptions = {
  chat: UseChatHelpers;
  createAIEditor: () => PlateEditor;
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
  scrollContainerSelector: string;
  /**
   * Template function for generating the system message. Supports the same
   * placeholders as `promptTemplate`.
   */
  systemTemplate: (props: EditorPromptParams) => string | void;
} & TriggerComboboxPluginOptions;

export type AIChatApi = {
  hide: () => void;
  reload: () => void;
  reset: () => void;
  show: () => void;
  stop: () => void;
  submit: (options?: { prompt?: EditorPrompt; system?: EditorPrompt }) => void;
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
  extendEditor: withTriggerAIChat,
  options: {
    chat: { messages: [] } as any,
    createAIEditor: () =>
      createPlateEditor({
        id: 'ai',
      }),
    open: false,
    promptTemplate: () => '{prompt}',
    scrollContainerSelector: '#scroll_container',
    systemTemplate: () => {},
    trigger: ' ',
    triggerPreviousCharPattern: /^\s?$/,
  },
  useHooks: useAIChatHooks,
})
  .extendApi<Pick<AIChatApi, 'stop' | 'submit'>>(
    ({ editor, getOptions, setOption }) => {
      return {
        reload: () => {
          const { chat } = getOptions();

          void chat.reload({
            body: {
              system: getEditorPrompt(editor, {
                promptTemplate: getOptions().systemTemplate,
              }),
            },
          });
        },
        stop: () => {
          getOptions().chat.stop();
        },
        submit: ({ prompt, system } = {}) => {
          const { chat } = getOptions();

          if (!prompt && chat.input.length === 0) {
            return;
          }
          if (!prompt) {
            prompt = chat.input;
          }

          chat.setInput('');

          void chat.append(
            {
              content: getEditorPrompt(editor, { prompt }) ?? '',
              role: 'user',
            },
            {
              body: {
                system: getEditorPrompt(editor, {
                  prompt: system,
                  promptTemplate: getOptions().systemTemplate,
                }),
              },
            }
          );
        },
      };
    }
  )
  .extendApi(({ api, editor, getOptions }) => ({
    reset: () => {
      api.aiChat.stop();

      const chat = getOptions().chat;

      if (chat.messages.length > 0) {
        chat.setMessages([]);
      }

      const someAINodes = someNode(editor, {
        match: (n) => !!n[AIPlugin.key],
      });

      if (!someAINodes) return;

      withMerging(editor, () => {
        editor.getTransforms(AIPlugin).ai.removeNodes();
        // editor.getTransforms(AIPlugin).ai.removeMarks();
      });

      editor.history.undos.pop();
    },
  }))
  .extendApi(({ api, getOptions, setOption }) => ({
    hide: () => {
      api.aiChat.reset();
      setOption('open', false);
      // focusEditor(editor);
    },
    show: () => {
      api.aiChat.reset();

      // const ancestor = getAncestorNode(editor);
      // if (ancestor) {
      //   aiPlugin.setOption('startPath', ancestor[1]);
      // }

      getOptions().chat.setMessages([]);

      setOption('open', true);
    },
  }))
  .extendTransforms(({ editor }) => ({
    accept: bindFirst(acceptAIChat, editor),
    insertBelow: bindFirst(insertBelowAIChat, editor),
    replaceSelection: bindFirst(replaceSelectionAIChat, editor),
  }));
