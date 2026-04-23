import type { SlateEditor } from 'platejs';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleTaskList } from './transforms';

const isListInputBlocked = (editor: SlateEditor) =>
  editor.api.some({
    match: {
      type: [editor.getType(KEYS.codeBlock)],
    },
  });

export const TaskListRules = {
  markdown: createRuleFactory<{}, { checked: boolean }>({
    type: 'blockStart',
    checked: false,
    enabled: ({ editor }) => !isListInputBlocked(editor),
    trigger: ' ',
    match: ({ checked }) => (checked ? '[x]' : '[]'),
    apply: ({ editor, checked }, match) => {
      editor.tf.delete({ at: match.range });
      toggleTaskList(editor, checked);

      return true;
    },
  }),
};
