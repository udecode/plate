import { MarkdownPlugin, remarkMdx, remarkMention } from 'platejs/markdown';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const MarkdownKit = [
  MarkdownPlugin.configure({
    initialState: {
      remarkPlugins: [
        remarkMath,
        remarkGfm,
        remarkEmoji,
        remarkMdx,
        remarkMention,
      ],
    },
  }),
];
