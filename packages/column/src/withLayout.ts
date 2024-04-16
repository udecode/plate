import {
  getAboveNode,
  isCollapsed,
  isElement,
  isStartPoint,
  PlateEditor,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN } from './createColumnPlugin';
import { normalizeColumn } from './normalizers/normalizedColumn';

export const withLayout = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E
) => {
  const { deleteBackward } = editor;

  editor.normalizeNode = normalizeColumn(editor);

  editor.deleteBackward = (unit) => {
    if (isCollapsed(editor.selection)) {
      const entry = getAboveNode(editor, {
        match: (n) => isElement(n) && n.type === ELEMENT_COLUMN,
      });

      if (entry) {
        const [node, path] = entry;

        if (node.children.length > 1) return deleteBackward(unit);
        const isStart = isStartPoint(editor, editor.selection?.anchor, path);
        if (isStart) return;
      }
    }
    deleteBackward(unit);
  };

  return editor;
};
