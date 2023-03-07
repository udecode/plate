import {
  getNodeEntries,
  isText,
  toDOMNode,
  toDOMRange,
  TReactEditor,
  Value,
} from '@udecode/plate-common';
import { Path, Range } from 'slate';
import { SelectionRect } from '../types';

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
    if (!domNode) {
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
        width: clientRect.width,
        height: clientRect.height,
        top: clientRect.top - yOffset,
        left: clientRect.left - xOffset,
      });
    }
  }

  return selectionRects;
};
