'use client';

import {
  MarkdownPlugin,
  REMARK_MDX_TAG,
  remarkMention,
  tagRemarkPlugin,
} from '@udecode/plate-markdown';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMdx from 'remark-mdx';

export const markdownPlugin = MarkdownPlugin.configure({
  options: {
    disallowedNodes: [SuggestionPlugin.key],
    remarkPlugins: [
      remarkMath,
      remarkGfm,
      tagRemarkPlugin(remarkMdx, REMARK_MDX_TAG),
      remarkMention,
    ],
  },
});
