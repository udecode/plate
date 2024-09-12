import {
  type ExtendEditor,
  getAboveNode,
  isCollapsed,
  isElement,
  isStartPoint,
} from '@udecode/plate-common';

import { BaseColumnItemPlugin } from './BaseColumnPlugin';
import { normalizeColumn } from './normalizers/normalizedColumn';

export const withColumn: ExtendEditor = ({ editor }) => {
  const { deleteBackward, isEmpty } = editor;

  editor.normalizeNode = normalizeColumn(editor);

  editor.deleteBackward = (unit) => {
    if (isCollapsed(editor.selection)) {
      const entry = getAboveNode(editor, {
        match: (n) => isElement(n) && n.type === BaseColumnItemPlugin.key,
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
    if (element?.type && element.type === BaseColumnItemPlugin.key) {
      return element.children.length === 1 && isEmpty(element.children[0]);
    }

    return isEmpty(element);
  };

  return editor;
};
