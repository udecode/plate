import { CopilotPlugin, stripMarkdownBlocks } from '@udecode/plate-ai/react';
import { type TElement, getAncestorNode } from '@udecode/plate-common';
import { serializeMdNodes } from '@udecode/plate-markdown';

import { GhostText } from '@/registry/default/plate-ui/ghost-text';

export const copilotPlugin = CopilotPlugin.configure(({ api }) => ({
  options: {
    completeOptions: {
      api: 'https://pro.platejs.org/api/ai/copilot',
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
      onFinish: (_, completion) => {
        if (completion === '0') return;

        api.copilot.setBlockSuggestion({
          text: stripMarkdownBlocks(completion),
        });
      },
    },
    debounceDelay: 500,
    getPrompt: ({ editor }) => {
      const contextEntry = getAncestorNode(editor);

      if (!contextEntry) return '';

      const prompt = serializeMdNodes([contextEntry[0] as TElement]);

      return `Continue the text up to the next punctuation mark:
"""
${prompt}
"""`;
    },
    renderGhostText: GhostText,
  },
}));
