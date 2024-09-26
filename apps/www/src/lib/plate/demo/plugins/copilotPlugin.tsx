import { CopilotPlugin } from '@udecode/plate-ai/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ParagraphPlugin } from '@udecode/plate-core/react';
import { HEADING_KEYS } from '@udecode/plate-heading';

import { AiCopilotHoverCard } from '@/registry/default/plate-ui/ai-copilot-hover-card';
import { MENTIONABLES } from '@/registry/default/plate-ui/mention-input-element';

export const copilotPlugin = CopilotPlugin.configure({
  options: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchSuggestion: async ({ abortSignal, prompt }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MENTIONABLES[Math.floor(Math.random() * 41)].text);
        }, 100);
      });
    },
    hoverCard: AiCopilotHoverCard,
    query: {
      allow: [
        ParagraphPlugin.key,
        BlockquotePlugin.key,
        HEADING_KEYS.h1,
        HEADING_KEYS.h2,
        HEADING_KEYS.h3,
        HEADING_KEYS.h4,
        HEADING_KEYS.h5,
        HEADING_KEYS.h6,
      ],
    },
  },
});
