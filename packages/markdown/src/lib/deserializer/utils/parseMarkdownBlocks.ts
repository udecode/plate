import type { Token } from 'marked';

import { marked } from 'marked';

export type ParseMarkdownBlocksOptions = {
  /**
   * Token types to exclude from the output.
   *
   * @default ['space']
   */
  exclude?: string[];
  /**
   * Whether to trim the content.
   *
   * @default true
   */
  trim?: boolean;
};

export const parseMarkdownBlocks = (
  content: string,
  { exclude = ['space'], trim = true }: ParseMarkdownBlocksOptions = {}
): Token[] => {
  let tokens = [...marked.lexer(content)];

  if (exclude.length > 0) {
    tokens = tokens.filter((token) => !exclude.includes(token.type));
  }
  if (trim) {
    tokens = tokens.map((token) => ({
      ...token,
      raw: token.raw.trimEnd(),
    }));
  }

  return tokens;
};
