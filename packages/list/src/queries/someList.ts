import type { PlateEditor } from '@udecode/plate-common/server';

import { getListItemEntry } from '../index';

export const someList = (editor: PlateEditor, type: string) => {
  return getListItemEntry(editor)?.list?.[0].type === type;
};
