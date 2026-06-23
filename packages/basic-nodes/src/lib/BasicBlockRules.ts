import { createRuleFactory, KEYS } from 'platejs';

const HEADING_KEY_RE = /^h([1-6])$/;
const THEMATIC_BREAK_DASH_RE = /^(--|—)$/;

const getHeadingMarkdownPrefix = (pluginKey: string) => {
  const match = HEADING_KEY_RE.exec(pluginKey);

  if (!match) return;

  return '#'.repeat(Number(match[1]));
};

export const HeadingRules = {
  markdown: createRuleFactory({
    type: 'blockStart',
    trigger: ' ',
    match: ({ pluginKey }) => getHeadingMarkdownPrefix(pluginKey),
  }),
};

export const BlockquoteRules = {
  markdown: createRuleFactory<{}, { marker: string }>({
    type: 'blockStart',
    marker: '>',
    trigger: ' ',
    enabled: ({ editor }) =>
      !editor.api.some({
        match: {
          type: [editor.getType(KEYS.codeBlock)],
        },
      }),
    match: ({ marker }) => marker,
    apply: ({ editor }, match) => {
      editor.update((tx) => {
        tx.text.delete({ at: match.range });
        tx.nodes.wrap(
          { children: [], type: editor.getType(KEYS.blockquote) },
          {
            match: (node) => editor.api.isBlock(node),
          }
        );
      });

      return true;
    },
  }),
};

export const HorizontalRuleRules = {
  markdown: createRuleFactory<{}, { variant: '-' | '_' }>({
    type: 'blockStart',
    variant: '-',
    match: ({ variant }) => (variant === '_' ? '___' : THEMATIC_BREAK_DASH_RE),
    trigger: ({ variant }) => (variant === '_' ? ' ' : '-'),
    apply: ({ editor, variant }) => {
      editor.update((tx) => {
        if (variant === '_') {
          tx.text.deleteBackward({ unit: 'character' });
        }

        tx.nodes.set({ type: KEYS.hr });
        tx.nodes.insert({
          children: [{ text: '' }],
          type: KEYS.p,
        });
      });

      return true;
    },
  }),
};
