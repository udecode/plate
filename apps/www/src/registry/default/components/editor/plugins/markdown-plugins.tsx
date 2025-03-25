import type { TSuggestionText } from '@udecode/plate-suggestion';

import { type mdast, MarkdownPlugin } from '@udecode/plate-markdown';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const markdownPlugins = MarkdownPlugin.configure({
  options: {
    components: {
      [SuggestionPlugin.key]: {
        isLeaf: true,
        serialize: (node: TSuggestionText, options): mdast.Text => {
          if (options.ignoreSuggestionType) {
            const suggestionData = options.editor
              .getApi(SuggestionPlugin)
              .suggestion.suggestionData(node);

            if (suggestionData?.type === options.ignoreSuggestionType)
              return {
                type: 'text',
                value: '',
              };
          }

          return {
            type: 'text',
            value: node.text,
          };
        },
      },
    },
    remarkPlugins: [remarkMath, remarkGfm],
  },
});
