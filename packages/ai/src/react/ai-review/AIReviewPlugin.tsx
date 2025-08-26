import { type PluginConfig, KEYS } from 'platejs';
import { createTPlatePlugin } from 'platejs/react';

import { EditorPromptParams, getEditorPrompt } from '../ai-chat';
import { useCompletion } from '@ai-sdk/react';

export type AIReviewPluginConfig = PluginConfig<
  'aiReview',
  {
    promptTemplate: (props: EditorPromptParams) => string;
    systemTemplate: (props: EditorPromptParams) => string | void;
    completion: null | ReturnType<typeof useCompletion>;
  },
  {
    aiReview: {
      generateComment: () => void;
    };
  }
>;

export const AIReviewPlugin = createTPlatePlugin<AIReviewPluginConfig>({
  key: KEYS.aiReview,
  options: {
    promptTemplate: () => '{prompt}',
    systemTemplate: () => {},
    completion: null,
  },
}).extendApi<AIReviewPluginConfig['api']['aiReview']>(
  ({ editor, getOption }) => ({
    generateComment: async () => {
      const prompt = getEditorPrompt(editor, {
        prompt: getOption('promptTemplate'),
      });

      const system = getEditorPrompt(editor, {
        promptTemplate: getOption('systemTemplate'),
      });

      const { complete } = getOption('completion')!;

      complete(prompt!, {
        body: {
          system,
        },
      });
    },
  })
);
