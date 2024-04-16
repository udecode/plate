import {
  getLastChildPath,
  isElement,
  PlateEditor,
  TNode,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_COLUMN_GROUP } from '../createColumnPlugin';
import { moveMiddleColumn } from '../transforms';
import { insertEmptyColumn } from '../transforms/insertEmptyColumn';
import { setColumnWidth } from '../transforms/setColumnWidth';
import { TColumnGroupElement } from '../types';

export const normalizeColumn = <V extends Value, N extends TNode>(
  editor: PlateEditor<V>
) => {
  const { normalizeNode } = editor;

  return function (entry: TNodeEntry<N>) {
    if (isElement(entry[0]) && entry[0].type === ELEMENT_COLUMN_GROUP) {
      normalizeColumnHelper(
        editor,
        entry as unknown as TNodeEntry<TColumnGroupElement>
      );
    }

    normalizeNode(entry);
  };
};

const normalizeColumnHelper = <V extends Value, N extends TColumnGroupElement>(
  editor: PlateEditor<V>,
  entry: TNodeEntry<N>
) => {
  const [node, _] = entry;

  const prevChildrenCnt = node.children.length;
  const currentLayout = node.layout;

  // 两栏 => 三栏
  if (prevChildrenCnt === 2) {
    const lastChildPath = getLastChildPath(entry);
    setColumnWidth(editor, entry, currentLayout);

    if (currentLayout === '1-1-1') {
      insertEmptyColumn(editor, {
        at: lastChildPath,
        width: '33%',
      });
    }

    if (currentLayout === '1-2-1') {
      insertEmptyColumn(editor, {
        at: lastChildPath,
        width: '60%',
      });
    }
  } else if (prevChildrenCnt === 3) {
    setColumnWidth(editor, entry, currentLayout);

    // 三栏 => 两栏
    if (currentLayout === '1-1' || currentLayout === '3-1') {
      moveMiddleColumn(editor, entry, { direction: 'left' });
    }

    if (currentLayout === '1-3') {
      moveMiddleColumn(editor, entry, { direction: 'left' });
    }
  }
};
