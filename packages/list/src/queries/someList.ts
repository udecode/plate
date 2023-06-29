import { PlateEditor, Value } from '@udecode/plate-common';

import { getListItemEntry } from '../index';

export const someList = <V extends Value>(
  editor: PlateEditor<V>,
  type: string
) => {
  return getListItemEntry(editor)?.list?.[0].type === type;
};
