import { MarkdownPlugin } from 'platejs/markdown';
import remarkCjkFriendlyGfmStrikethrough from 'remark-cjk-friendly-gfm-strikethrough/bidi';
import remarkCjkFriendly from 'remark-cjk-friendly/bidi';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const MarkdownKit = [
  MarkdownPlugin.configure({
    initialState: {
      remarkPlugins: [
        remarkMath,
        remarkGfm,
        remarkCjkFriendly,
        remarkCjkFriendlyGfmStrikethrough,
        remarkEmoji,
      ],
    },
  }),
];
