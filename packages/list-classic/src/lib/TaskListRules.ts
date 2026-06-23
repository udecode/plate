import type { SlateEditor } from '@platejs/core';

import { createRuleFactory } from '@platejs/core';
import { KEYS } from '@platejs/utils';

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
      editor.update((tx) => {
        tx.text.delete({ at: match.range });
      });
      toggleTaskList(editor, checked);

      return true;
    },
  }),
};
