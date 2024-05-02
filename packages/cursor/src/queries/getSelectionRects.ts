import {
  type TReactEditor,
  toDOMNode,
  toDOMRange,
} from '@udecode/plate-common';
import {
  type Value,
  getNodeEntries,
  isText,
} from '@udecode/plate-common/server';
import { Path, Range } from 'slate';

import type { SelectionRect } from '../types';

export const getSelectionRects = <V extends Value>(
  editor: TReactEditor<V>,
  {
    range,
    xOffset,
    yOffset,
  }: {
    range: Range;
    xOffset: number;
    yOffset: number;
  }
): SelectionRect[] => {
  const [start, end] = Range.edges(range);
  const domRange = toDOMRange(editor, range);

  if (!domRange) {
    return [];
  }

  const selectionRects: SelectionRect[] = [];
  const textEntries = getNodeEntries(editor, {
    at: range,
    match: isText,
  });

  for (const [textNode, textPath] of textEntries) {
    const domNode = toDOMNode(editor, textNode);

    // Fix: failed to execute 'selectNode' on 'Range': the given Node has no parent
    if (!domNode?.parentElement) {
      return [];
    }

    const isStartNode = Path.equals(textPath, start.path);
    const isEndNode = Path.equals(textPath, end.path);

    let clientRects: DOMRectList | null = null;

    if (isStartNode || isEndNode) {
      const nodeRange = document.createRange();

      nodeRange.selectNode(domNode);

      if (isStartNode) {
        nodeRange.setStart(domRange.startContainer, domRange.startOffset);
      }
      if (isEndNode) {
        nodeRange.setEnd(domRange.endContainer, domRange.endOffset);
      }

      clientRects = nodeRange.getClientRects();
    } else {
      clientRects = domNode.getClientRects();
    }

    for (let i = 0; i < clientRects.length; i++) {
      const clientRect = clientRects.item(i);

      if (!clientRect) {
        continue;
      }

      selectionRects.push({
        height: clientRect.height,
        left: clientRect.left - xOffset,
        top: clientRect.top - yOffset,
        width: clientRect.width,
      });
    }
  }

  return selectionRects;
};
