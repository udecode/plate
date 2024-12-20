import {
  type ExtendEditor,
  getAboveNode,
  isCollapsed,
  isElement,
  isStartPoint,
  removeNodes,
  setNodes,
  unwrapNodes,
} from '@udecode/plate-common';

import type { TColumnElement, TColumnGroupElement } from './types';

import { BaseColumnItemPlugin, BaseColumnPlugin } from './BaseColumnPlugin';

export const withColumn: ExtendEditor = ({ editor }) => {
  const { deleteBackward, normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [n, path] = entry;

    // If it's a column group, ensure it has valid children
    if (isElement(n) && n.type === BaseColumnPlugin.key) {
      const node = n as TColumnGroupElement;

      // If no columns found, unwrap the column group
      if (
        !node.children.some(
          (child) =>
            isElement(child) &&
            child.type === editor.getType(BaseColumnItemPlugin)
        )
      ) {
        removeNodes(editor, { at: path });

        return;
      }
      // If only one column remains, unwrap the group (optional logic)
      if (node.children.length < 2) {
        editor.withoutNormalizing(() => {
          unwrapNodes(editor, { at: path });
          unwrapNodes(editor, { at: path });
        });

        return;
      }

      // PERF: only run when the number of columns changes
      editor.withoutNormalizing(() => {
        // Add new width normalization logic
        const totalColumns = node.children.length;
        let widths = node.children.map((col) => {
          const parsed = Number.parseFloat(col.width);

          return Number.isNaN(parsed) ? 0 : parsed;
        });

        const sum = widths.reduce((acc, w) => acc + w, 0);

        if (sum !== 100) {
          const diff = 100 - sum;
          const adjustment = diff / totalColumns;

          widths = widths.map((w) => w + adjustment);

          // Update the columns with the new widths
          widths.forEach((w, i) => {
            const columnPath = path.concat([i]);
            setNodes<TColumnElement>(
              editor,
              { width: `${w}%` },
              { at: columnPath }
            );
          });
        }
      });
    }
    // If it's a column, ensure it has at least one block (optional)
    if (isElement(n) && n.type === BaseColumnItemPlugin.key) {
      const node = n as TColumnElement;

      if (node.children.length === 0) {
        removeNodes(editor, { at: path });

        return;
      }
    }

    return normalizeNode(entry);
  };

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

  return editor;
};

// const prevChildrenCnt = node.children.length;
//   const currentLayout = node.layout;

//   if (currentLayout) {
//     const currentChildrenCnt = currentLayout.length;

//     const groupPathRef = createPathRef(editor, path);

//     if (prevChildrenCnt === 2 && currentChildrenCnt === 3) {
//       const lastChildPath = getLastChildPath(entry);

//       insertColumn(editor, {
//         at: lastChildPath,
//       });

//       setColumnWidth(editor, groupPathRef, currentLayout);

//       return;
//     }
//     if (prevChildrenCnt === 3 && currentChildrenCnt === 2) {
//       moveMiddleColumn(editor, entry, { direction: 'left' });
//       setColumnWidth(editor, groupPathRef, currentLayout);

//       return;
//     }
//     if (prevChildrenCnt === currentChildrenCnt) {
//       setColumnWidth(editor, groupPathRef, currentLayout);

//       return;
//     }
//   }
