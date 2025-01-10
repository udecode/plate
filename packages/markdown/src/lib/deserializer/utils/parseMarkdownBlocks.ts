import type { Token } from 'marked';

import { marked } from 'marked';

export const parseMarkdownBlocks = (
  content: string,
  {
    excludeTokens = ['space'],
  }: {
    excludeTokens?: string[];
  }
): Token[] => {
  if (excludeTokens.length > 0) {
    return marked
      .lexer(content)
      .filter((token) => !excludeTokens.includes(token.type));
  }

  return marked.lexer(content);
};
