import type { BaseEditor } from '@platejs/core';

import { createRuleFactory, KEYS } from 'platejs';

import { toggleTaskList } from './transforms';

const isListInputBlocked = (editor: BaseEditor) =>
  editor.read.nodes.some({
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
    apply: ({ editor, checked, tx }, match) => {
      tx.text.delete({ at: match.range });
      toggleTaskList(editor, tx, checked);

      return true;
    },
  }),
};
