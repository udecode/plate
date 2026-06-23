import type { Range } from '@platejs/plite';

import { TextApi } from '@platejs/plite';

import type { SelectionRect } from '../types';

type SelectionRectsEditor = {
  api: any;
};

export const getSelectionRects = (
  editor: SelectionRectsEditor,
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
  if (!editor.api.dom?.resolveDOMRange) {
    return [];
  }

  const domRange = editor.api.dom.resolveDOMRange(range);

  if (!domRange) {
    return [];
  }

  const selectionRects: SelectionRect[] = [];
  const textEntries = Array.from(
    editor.api.nodes({
      at: range,
      match: TextApi.isText,
    })
  );

  for (let index = 0; index < textEntries.length; index++) {
    const [textNode] = textEntries[index] as [unknown, number[]];
    const domNode = editor.api.dom.resolveDOMNode(textNode);

    // Fix: failed to execute 'selectNode' on 'Range': the given Node has no parent
    if (!domNode?.parentElement) {
      return [];
    }

    const isStartNode = index === 0;
    const isEndNode = index === textEntries.length - 1;

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

    if (!clientRects) {
      continue;
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
