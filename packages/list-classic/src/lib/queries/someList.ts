import type { BasePlateEditor } from '@platejs/core';

import { getListItemEntry } from '../index';

export const someList = (editor: BasePlateEditor, type: string) =>
  getListItemEntry(editor)?.list?.[0].type === type;
