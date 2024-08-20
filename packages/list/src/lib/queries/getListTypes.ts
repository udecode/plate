import type { SlateEditor } from '@udecode/plate-common';

import { ListOrderedPlugin, ListUnorderedPlugin } from '../ListPlugin';

export const getListTypes = (editor: SlateEditor) => {
  return [
    editor.getType(ListOrderedPlugin),
    editor.getType(ListUnorderedPlugin),
  ];
};
