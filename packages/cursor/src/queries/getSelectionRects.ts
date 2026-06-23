import type { Range } from '@platejs/slate';

import { PathApi, RangeApi, TextApi } from 'platejs';

import type { SelectionRect } from '../types';

type SelectionRectsEditor = {
  api: {
    dom: {
      resolveDOMNode: (node: unknown) => HTMLElement | null;
      resolveDOMRange: (range: Range) => globalThis.Range | null;
    };
    nodes: (options: {
      at: Range;
      match: typeof TextApi.isText;
    }) => Iterable<[unknown, number[]]>;
  };
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
  const [start, end] = RangeApi.edges(range);
  const domRange = editor.api.dom.resolveDOMRange(range);

  if (!domRange) {
    return [];
  }

  const selectionRects: SelectionRect[] = [];
  const textEntries = editor.api.nodes({
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
