import type { PlateEditor } from '@udecode/plate-common';

import { ListOrderedPlugin, ListUnorderedPlugin } from '../ListPlugin';

export const getListTypes = (editor: PlateEditor) => {
  return [
    editor.getType(ListOrderedPlugin),
    editor.getType(ListUnorderedPlugin),
  ];
};
