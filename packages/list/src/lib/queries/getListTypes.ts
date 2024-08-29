import type { SlateEditor } from '@udecode/plate-common';

import { BulletedListPlugin, NumberedListPlugin } from '../ListPlugin';

export const getListTypes = (editor: SlateEditor) => {
  return [
    editor.getType(NumberedListPlugin),
    editor.getType(BulletedListPlugin),
  ];
};
