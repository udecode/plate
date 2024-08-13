import {
  type PlateEditor,
  type TNode,
  type TNodeEntry,
  createPathRef,
  getLastChildPath,
  isElement,
} from '@udecode/plate-common';

import type { TColumnGroupElement } from '../types';

import { ColumnPlugin } from '../ColumnPlugin';
import { moveMiddleColumn } from '../transforms';
import { insertEmptyColumn } from '../transforms/insertEmptyColumn';
import { setColumnWidth } from '../transforms/setColumnWidth';

export const normalizeColumn = <N extends TNode>(editor: PlateEditor) => {
  const { normalizeNode } = editor;

  return function (entry: TNodeEntry<N>) {
    if (isElement(entry[0]) && entry[0].type === ColumnPlugin.key) {
      return normalizeColumnHelper(
        editor,
        entry as unknown as TNodeEntry<TColumnGroupElement>
      );
    }

    return normalizeNode(entry);
  };
};

const normalizeColumnHelper = <N extends TColumnGroupElement>(
  editor: PlateEditor,
  entry: TNodeEntry<N>
) => {
  const [node, path] = entry;

  const prevChildrenCnt = node.children.length;
  const currentLayout = node.layout;

  if (!currentLayout) return;

  const currentChildrenCnt = currentLayout.length;

  const groupPathRef = createPathRef(editor, path);

  if (prevChildrenCnt === 2 && currentChildrenCnt === 3) {
    const lastChildPath = getLastChildPath(entry);

    insertEmptyColumn(editor, {
      at: lastChildPath,
    });

    setColumnWidth(editor, groupPathRef, currentLayout);
  }
  if (prevChildrenCnt === 3 && currentChildrenCnt === 2) {
    moveMiddleColumn(editor, entry, { direction: 'left' });
    setColumnWidth(editor, groupPathRef, currentLayout);
  }
  if (prevChildrenCnt === currentChildrenCnt) {
    setColumnWidth(editor, groupPathRef, currentLayout);
  }
};
