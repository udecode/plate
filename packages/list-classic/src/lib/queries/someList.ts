import type { BaseEditor } from '@platejs/core';

import { getListItemEntry } from '../index';

export const someList = (editor: BaseEditor, type: string) =>
  getListItemEntry(editor)?.list?.[0].type === type;
