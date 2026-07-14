import type { BaseEditor } from '@platejs/core';

import { KEYS } from 'platejs';

export const getListTypes = (editor: BaseEditor) => [
  editor.getType(KEYS.olClassic),
  editor.getType(KEYS.ulClassic),
  editor.getType(KEYS.taskList),
];
