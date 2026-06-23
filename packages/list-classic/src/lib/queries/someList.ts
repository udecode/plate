import type { SlateEditor } from '@platejs/core';

import { getListItemEntry } from '../index';

export const someList = (editor: SlateEditor, type: string) =>
  getListItemEntry(editor)?.list?.[0].type === type;
