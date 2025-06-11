'use client';

import type { TElement } from 'platejs';

import { faker } from '@faker-js/faker';
import { CopilotPlugin } from '@platejs/ai/react';
import { serializeMd, stripMarkdown } from '@platejs/markdown';

import { GhostText } from '@/components/ui/ghost-text';

import { MarkdownKit } from './markdown-kit';

export const CopilotKit = [
  ...MarkdownKit,
  CopilotPlugin.configure(({ api }) => ({
    options: {
      completeOptions: {
        api: '/api/ai/copilot',
        body: {
          system: `You are an advanced AI writing assistant, similar to VSCode Copilot but for general text. Your task is to predict and generate the next part of the text based on the given context.
  
  Rules:
  - Continue the text naturally up to the next punctuation mark (., ,, ;, :, ?, or !).
  - Maintain style and tone. Don't repeat given text.
  - For unclear context, provide the most likely continuation.
  - Handle code snippets, lists, or structured text if needed.
  - Don't include """ in your response.
  - CRITICAL: Always end with a punctuation mark.
  - CRITICAL: Avoid starting a new block. Do not use block formatting like >, #, 1., 2., -, etc. The suggestion should continue in the same block as the context.
  - If no context is provided or you can't generate a continuation, return "0" without explanation.`,
        },
        onError: () => {
          // Mock the API response. Remove it when you implement the route /api/ai/copilot
          api.copilot.setBlockSuggestion({
            text: stripMarkdown(faker.lorem.sentence()),
          });
        },
        onFinish: (_, completion) => {
          if (completion === '0') return;

          api.copilot.setBlockSuggestion({
            text: stripMarkdown(completion),
          });
        },
      },
      debounceDelay: 500,
      renderGhostText: GhostText,
      getPrompt: ({ editor }) => {
        const contextEntry = editor.api.block({ highest: true });

        if (!contextEntry) return '';

        const prompt = serializeMd(editor, {
          value: [contextEntry[0] as TElement],
        });

        return `Continue the text up to the next punctuation mark:
  """
  ${prompt}
  """`;
      },
    },
    shortcuts: {
      accept: {
        keys: 'tab',
      },
      acceptNextWord: {
        keys: 'mod+right',
      },
      reject: {
        keys: 'escape',
      },
      triggerSuggestion: {
        keys: 'ctrl+space',
      },
    },
  })),
];
