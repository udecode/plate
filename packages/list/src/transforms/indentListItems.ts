import type { PlateEditor, Value } from '@udecode/plate-common/server';

import { moveListItems } from './moveListItems';

export const indentListItems = <V extends Value>(editor: PlateEditor<V>) => {
  moveListItems(editor, { increase: true });
};
