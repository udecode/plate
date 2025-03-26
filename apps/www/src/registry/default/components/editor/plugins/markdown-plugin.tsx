import { MarkdownPlugin } from '@udecode/plate-markdown';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const markdownPlugin = MarkdownPlugin.configure({
  options: {
    disallowedNodes: {
      deserialize: [],
      serialize: [SuggestionPlugin.key],
    },
    remarkPlugins: [remarkMath, remarkGfm],
  },
});
