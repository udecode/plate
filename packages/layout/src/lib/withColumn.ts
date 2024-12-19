import {
  type ExtendEditor,
  createPathRef,
  getAboveNode,
  getLastChildPath,
  isCollapsed,
  isElement,
  isStartPoint,
  removeNodes,
  unwrapNodes,
} from '@udecode/plate-common';

import type { TColumnElement, TColumnGroupElement } from './types';

import { BaseColumnItemPlugin, BaseColumnPlugin } from './BaseColumnPlugin';
import { insertColumn, moveMiddleColumn, setColumnWidth } from './transforms';

export const withColumn: ExtendEditor = ({ editor }) => {
  const { deleteBackward, isEmpty, normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [n, path] = entry;

    if (isElement(n) && n.type === BaseColumnPlugin.key) {
      const node = n as TColumnGroupElement;

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
      if (node.children.length < 2) {
        editor.withoutNormalizing(() => {
          unwrapNodes(editor, { at: path });
          unwrapNodes(editor, { at: path });
        });

        return;
      }

      const prevChildrenCnt = node.children.length;
      const currentLayout = node.layout;

      if (currentLayout) {
        const currentChildrenCnt = currentLayout.length;

        const groupPathRef = createPathRef(editor, path);

        if (prevChildrenCnt === 2 && currentChildrenCnt === 3) {
          const lastChildPath = getLastChildPath(entry);

          insertColumn(editor, {
            at: lastChildPath,
          });

          setColumnWidth(editor, groupPathRef, currentLayout);

          return;
        }
        if (prevChildrenCnt === 3 && currentChildrenCnt === 2) {
          moveMiddleColumn(editor, entry, { direction: 'left' });
          setColumnWidth(editor, groupPathRef, currentLayout);

          return;
        }
        if (prevChildrenCnt === currentChildrenCnt) {
          setColumnWidth(editor, groupPathRef, currentLayout);

          return;
        }
      }
    }
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

  editor.isEmpty = (element: any) => {
    if (element?.type && element.type === BaseColumnItemPlugin.key) {
      return element.children.length === 1 && isEmpty(element.children[0]);
    }

    return isEmpty(element);
  };

  return editor;
};
