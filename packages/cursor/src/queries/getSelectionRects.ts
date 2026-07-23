import type { DOMEditor } from '@platejs/plite-dom';
import {
  type Range,
  type Value,
  PathApi,
  RangeApi,
  TextApi,
} from '@platejs/plite';

import type { SelectionRect } from '../types';

export const getSelectionRects = <V extends Value>(
  editor: DOMEditor<V>,
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
  const [start, end] = RangeApi.edges(range);
  const domRange = editor.api.dom.resolveDOMRange(range);

  if (!domRange) {
    return [];
  }

  const selectionRects: SelectionRect[] = [];
  const textEntries = editor.read.nodes.toArray({
    at: range,
    match: TextApi.isText,
  });

  for (const [textNode, textPath] of textEntries) {
    const domNode = editor.api.dom.resolveDOMNode(textNode);

    // Fix: failed to execute 'selectNode' on 'Range': the given Node has no parent
    if (!domNode?.parentElement) {
      return [];
    }

    const isStartNode = PathApi.equals(textPath, start.path);
    const isEndNode = PathApi.equals(textPath, end.path);

    let clientRects: DOMRectList;

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
