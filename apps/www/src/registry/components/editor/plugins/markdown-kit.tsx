'use client';

import { KEYS } from '@udecode/plate';
import {
  MarkdownPlugin,
  remarkMdx,
  remarkMention,
} from '@udecode/plate-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const MarkdownKit = [
  MarkdownPlugin.configure({
    options: {
      disallowedNodes: [KEYS.suggestion],
      remarkPlugins: [remarkMath, remarkGfm, remarkMdx, remarkMention],
    },
  }),
];
