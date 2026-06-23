import type { SlateEditor } from '@platejs/core';

import { KEYS } from '@platejs/utils';

export const getListTypes = (editor: SlateEditor) => [
  editor.getType(KEYS.olClassic),
  editor.getType(KEYS.ulClassic),
  editor.getType(KEYS.taskList),
];
