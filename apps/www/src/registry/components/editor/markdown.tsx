import { PLUGINS } from 'platejs';
import { MarkdownPlugin, remarkMdx, remarkMention } from 'platejs/markdown';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export const MarkdownKit = [
  MarkdownPlugin.configure(({ editor }) => {
    const comment = editor.plugin(PLUGINS.comment);
    const suggestion = editor.plugin(PLUGINS.suggestion);
    const plainMarks: string[] = [];

    if (suggestion.installed) {
      plainMarks.push(suggestion.schema.key);
    }
    if (comment.installed) {
      plainMarks.push(comment.schema.key);
    }

    return {
      initialState: {
        plainMarks,
        remarkPlugins: [
          remarkMath,
          remarkGfm,
          remarkEmoji,
          remarkMdx,
          remarkMention,
        ],
      },
    };
  }),
];
