'use client';

import { faker } from '@faker-js/faker';
import type { Element } from 'platejs';
import { CopilotPlugin } from 'platejs/ai/react';
import { stripMarkdown } from 'platejs/markdown';
import { useEditor, useElement, usePluginStore } from 'platejs/react';
import * as React from 'react';

export function GhostText() {
  const editor = useEditor();
  const element = useElement();

  const isSuggested = usePluginStore(
    CopilotPlugin,
    'isSuggested',
    editor.key(element)
  );

  if (!isSuggested) return null;

  return <GhostTextContent />;
}

function GhostTextContent() {
  const suggestionText = usePluginStore(CopilotPlugin, 'suggestionText');

  return (
    <span
      className="pointer-events-none text-muted-foreground/70 max-sm:hidden"
      contentEditable={false}
    >
      {suggestionText}
    </span>
  );
}

export const CopilotKit = [
  CopilotPlugin.configure(({ update }) => ({
    initialState: {
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
          update.setBlockSuggestion({
            text: stripMarkdown(faker.lorem.sentence()),
          });
        },
        onFinish: (_, completion) => {
          if (completion === '0') return;

          update.setBlockSuggestion({
            text: stripMarkdown(completion),
          });
        },
      },
      debounceDelay: 500,
      renderGhostText: GhostText,
      getPrompt: ({ editor }) => {
        const contextEntry = editor.read.nodes.block();

        if (!contextEntry) return '';

        const prompt = editor.api.markdown.serialize({
          value: { children: [contextEntry[0] as Element] },
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
