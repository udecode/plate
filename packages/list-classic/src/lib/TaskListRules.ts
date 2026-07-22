import type { BaseEditor } from '@platejs/core';
import type { EditorStateView } from '@platejs/plite';

import { createRuleFactory } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { toggleTaskList } from './transforms';

const isListInputBlocked = (
  editor: BaseEditor,
  state: Pick<EditorStateView, 'nodes'>
) =>
  state.nodes.some({
    match: {
      type: [editor.getType(KEYS.codeBlock)],
    },
  });

export const TaskListRules = {
  markdown: createRuleFactory<{}, { checked: boolean }>({
    type: 'blockStart',
    checked: false,
    enabled: ({ editor, tx }) => !isListInputBlocked(editor, tx),
    trigger: ' ',
    match: ({ checked }) => (checked ? '[x]' : '[]'),
    apply: ({ editor, checked, tx }, match) => {
      tx.text.delete({ at: match.range });
      toggleTaskList(editor, tx, checked);

      return true;
    },
  }),
};
