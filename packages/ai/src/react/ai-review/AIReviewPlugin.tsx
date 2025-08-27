import type { useCompletion } from '@ai-sdk/react';

import { type PluginConfig, KEYS } from 'platejs';
import { createTPlatePlugin } from 'platejs/react';

import { type EditorPromptParams, getEditorPrompt } from '../ai-chat';

export type AIReviewPluginConfig = PluginConfig<
  'aiReview',
  {
    completion: ReturnType<typeof useCompletion> | null;
    promptTemplate: (props: EditorPromptParams) => string;
    systemTemplate: (props: EditorPromptParams) => string | void;
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
    completion: null,
    promptTemplate: () => '{prompt}',
    systemTemplate: () => {},
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
