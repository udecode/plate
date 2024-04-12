import { PlateEditor } from '@udecode/plate-core';
import { isElement, TNode, TNodeEntry, Value } from '@udecode/slate';
import { getLastChildPath } from '@udecode/slate-utils';

import { ELEMENT_LAYOUT } from '../createLayoutPlugin';
import { TLayoutBlockElement } from '../layout-store';
import { moveMiddleLayout } from '../transforms';
import { insertEmptyLayoutChild } from '../transforms/insertEmptyLayoutChild';
import { setLayoutChildWidth } from '../transforms/setLayoutChildWidth';

export const normalizeLayout = <V extends Value, N extends TNode>(
  editor: PlateEditor<V>
) => {
  const { normalizeNode } = editor;

  return function (entry: TNodeEntry<N>) {
    if (isElement(entry[0]) && entry[0].type === ELEMENT_LAYOUT) {
      normalizeLayoutHelper(
        editor,
        entry as unknown as TNodeEntry<TLayoutBlockElement>
      );
    }

    normalizeNode(entry);
  };
};

const normalizeLayoutHelper = <V extends Value, N extends TLayoutBlockElement>(
  editor: PlateEditor<V>,
  entry: TNodeEntry<N>
) => {
  const [node, _] = entry;

  const prevChildrenCnt = node.children.length;
  const currentLayout = node.layout;

  // 两栏 => 三栏
  if (prevChildrenCnt === 2) {
    const lastChildPath = getLastChildPath(entry);
    setLayoutChildWidth(editor, entry, currentLayout);

    if (currentLayout === '1-1-1') {
      insertEmptyLayoutChild(editor, {
        at: lastChildPath,
        width: '33%',
      });
    }

    if (currentLayout === '1-2-1') {
      insertEmptyLayoutChild(editor, {
        at: lastChildPath,
        width: '60%',
      });
    }
  } else if (prevChildrenCnt === 3) {
    setLayoutChildWidth(editor, entry, currentLayout);

    // 三栏 => 两栏
    if (currentLayout === '1-1' || currentLayout === '3-1') {
      moveMiddleLayout(editor, entry, { direction: 'left' });
    }

    if (currentLayout === '1-3') {
      moveMiddleLayout(editor, entry, { direction: 'left' });
    }
  }
};
