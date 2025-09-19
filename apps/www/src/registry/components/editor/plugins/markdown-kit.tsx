import { MarkdownPlugin, remarkMdx, remarkMention } from '@platejs/markdown';
import { KEYS } from 'platejs';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const MarkdownKit = [
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [remarkMath, remarkGfm, remarkMdx, remarkMention],
      plainMarks: [KEYS.suggestion, KEYS.comment],
    },
  }),
];
