import { type PluginConfig, KEYS } from 'platejs';
import { createTPlatePlugin } from 'platejs/react';

import { EditorPromptParams, getEditorPrompt } from '../ai-chat';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { useCompletion } from '@ai-sdk/react';

export type AIReviewPluginConfig = PluginConfig<
  'aiReview',
  {
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
  dependencies: ['ai'],
  options: {
    promptTemplate: () => '{prompt}',
    systemTemplate: () => {},
  },
})
  .extendApi<AIReviewPluginConfig['api']['aiReview']>(
    ({ editor, getOption }) => ({
      generateComment: async () => {
        const prompt = getEditorPrompt(editor, {
          prompt: getOption('promptTemplate'),
        });

        const system = getEditorPrompt(editor, {
          promptTemplate: getOption('systemTemplate'),
        });
      },
    })
  )
  .extend({
    useHooks: ({ editor, getOption }) => {
      const { completion, handleSubmit } = useCompletion({
        api: '/api/ai/review',
      });

      return {
        completion,
      };
    },
  });
