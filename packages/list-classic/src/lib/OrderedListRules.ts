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
  new RegExp(`^\\d+\\${variant}$`);

export const OrderedListRules = {
  markdown: createRuleFactory<{}, { variant: '.' | ')' }>({
    type: 'blockStart',
    variant: '.',
    enabled: ({ editor }) => !isListInputBlocked(editor),
    trigger: ' ',
    match: ({ variant }) => getOrderedListPattern(variant),
    apply: ({ editor }, match) => {
      editor.tf.delete({ at: match.range });
      toggleList(editor, {
        type: editor.getType(KEYS.olClassic),
      });

      return true;
    },
  }),
};
