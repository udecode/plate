import type { SlateEditor } from 'platejs';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleList } from './transforms';

const isListInputBlocked = (editor: SlateEditor) =>
  editor.api.some({
    match: {
      type: [editor.getType(KEYS.codeBlock)],
    },
  });

const getOrderedListPattern = (variant: '.' | ')') =>
  new RegExp(`^(\\d+)${variant === ')' ? '\\)' : '\\.'}$`);

export const OrderedListRules = {
  markdown: createRuleFactory<{}, { variant: '.' | ')' }, { start: number }>({
    type: 'blockStart',
    variant: '.',
    enabled: ({ editor }) => !isListInputBlocked(editor),
    trigger: ' ',
    match: ({ variant }) => getOrderedListPattern(variant),
    resolveMatch: ({ match }) => ({
      start: Number((match as RegExpMatchArray)[1]),
    }),
    apply: ({ editor }, match) => {
      editor.tf.delete({ at: match.range });
      toggleList(editor, {
        listRestartPolite: match.start || 1,
        listStyleType: KEYS.ol,
      });

      return true;
    },
  }),
};
