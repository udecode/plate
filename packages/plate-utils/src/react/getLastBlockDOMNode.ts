import type { PlateEditor } from '@udecode/plate-core/react';

export const getLastBlockDOMNode = (editor: PlateEditor) => {
  return editor.api.toDOMNode(editor.api.blocks().at(-1)![0]);
};
