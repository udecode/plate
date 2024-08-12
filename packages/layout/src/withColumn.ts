import {
  type WithOverride,
  getAboveNode,
  isCollapsed,
  isElement,
  isStartPoint,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN } from './ColumnPlugin';
import { normalizeColumn } from './normalizers/normalizedColumn';

export const withColumn: WithOverride = ({ editor }) => {
  const { deleteBackward, isEmpty } = editor;

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

  editor.isEmpty = (element: any) => {
    if (element?.type && element.type === ELEMENT_COLUMN) {
      return element.children.length === 1 && isEmpty(element.children[0]);
    }

    return isEmpty(element);
  };

  return editor;
};
