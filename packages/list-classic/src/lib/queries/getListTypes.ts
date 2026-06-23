import type { BasePlateEditor } from '@platejs/core';

import { KEYS } from '@platejs/utils';

export const getListTypes = (editor: BasePlateEditor) => [
  editor.getType(KEYS.olClassic),
  editor.getType(KEYS.ulClassic),
  editor.getType(KEYS.taskList),
];
