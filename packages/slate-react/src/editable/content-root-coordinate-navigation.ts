import { type Point, type Range, RangeApi } from '@platejs/slate';

import type { ReactRuntimeEditor } from '../plugin/react-editor';

export const hasUsableRect = (rect: DOMRect | null): rect is DOMRect =>
  !!rect &&
  Number.isFinite(rect.left) &&
  Number.isFinite(rect.right) &&
  Number.isFinite(rect.top) &&
  Number.isFinite(rect.bottom) &&
  (rect.left !== 0 || rect.right !== 0 || rect.top !== 0 || rect.bottom !== 0);

export const resolveUsableRangeRect = (
  editor: ReactRuntimeEditor,
  range: Range
): DOMRect | null => {
  const domRange = editor.api.dom.resolveDOMRange(range);
  const clientRect = Array.from(domRange?.getClientRects() ?? [])[0] ?? null;
  const boundingRect = domRange?.getBoundingClientRect() ?? null;
  const domPointRect = RangeApi.isCollapsed(range)
    ? (() => {
        const domPoint = editor.api.dom.resolveDOMPoint(range.anchor);
        const domNode = domPoint?.[0];
        const element =
          domNode?.nodeType === Node.ELEMENT_NODE
            ? (domNode as HTMLElement)
            : ((domNode?.parentElement as HTMLElement | null) ?? null);

        return element?.getBoundingClientRect() ?? null;
      })()
    : null;

  return hasUsableRect(clientRect)
    ? clientRect
    : hasUsableRect(boundingRect)
      ? boundingRect
      : hasUsableRect(domPointRect)
        ? domPointRect
        : null;
};

const getUsableDOMRangeRect = (range: globalThis.Range): DOMRect | null => {
  const clientRect = Array.from(range.getClientRects())[0] ?? null;
  const boundingRect = range.getBoundingClientRect();

  return hasUsableRect(clientRect)
    ? clientRect
    : hasUsableRect(boundingRect)
      ? boundingRect
      : null;
};

const getCollapsedTextOffsetRect = (
  document: Document,
  textNode: Node,
  offset: number
): { distanceX: (x: number) => number; offset: number } | null => {
  const textLength = textNode.textContent?.length ?? 0;
  const safeOffset = Math.max(0, Math.min(offset, textLength));
  const range = document.createRange();

  range.setStart(textNode, safeOffset);
  range.collapse(true);

  const rect = getUsableDOMRangeRect(range);

  if (rect) {
    return {
      distanceX: (x) => Math.abs(rect.left - x),
      offset: safeOffset,
    };
  }

  if (textLength === 0) {
    return null;
  }

  const probeStart =
    safeOffset >= textLength ? Math.max(0, textLength - 1) : safeOffset;
  const probeEnd = Math.min(textLength, probeStart + 1);

  if (probeEnd <= probeStart) {
    return null;
  }

  const probeRange = document.createRange();

  probeRange.setStart(textNode, probeStart);
  probeRange.setEnd(textNode, probeEnd);

  const probeRect = getUsableDOMRangeRect(probeRange);

  if (!probeRect) {
    return null;
  }

  return {
    distanceX: (x) =>
      Math.abs(
        safeOffset >= textLength ? probeRect.right - x : probeRect.left - x
      ),
    offset: safeOffset,
  };
};

const resolvePointFromDOMRange = (
  editor: ReactRuntimeEditor,
  domRange: globalThis.Range
): Point | null => {
  const range = editor.api.dom.resolveSlateRange(domRange, {
    exactMatch: false,
  });

  return range && RangeApi.isCollapsed(range) ? range.anchor : null;
};

const getPointNearCoordinatesFromSlateDOM = (
  editor: ReactRuntimeEditor,
  x: number,
  y: number
): Point | null => {
  const editorElement = editor.api.dom.resolveDOMNode(editor);

  if (!editorElement) {
    return null;
  }

  const strings = Array.from(
    editorElement.querySelectorAll(
      '[data-slate-string], [data-slate-zero-width]'
    )
  );
  const bestString = strings
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const verticalDistance =
        y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;

      return { element, rect, verticalDistance };
    })
    .sort((left, right) => {
      if (left.verticalDistance !== right.verticalDistance) {
        return left.verticalDistance - right.verticalDistance;
      }

      return (
        Math.abs(left.rect.left + left.rect.width / 2 - x) -
        Math.abs(right.rect.left + right.rect.width / 2 - x)
      );
    })[0]?.element;
  const textNode = Array.from(bestString?.childNodes ?? []).find(
    (node) => node.nodeType === Node.TEXT_NODE
  );

  if (!textNode) {
    return null;
  }

  const { document } = editor.api.dom.getWindow();
  const textLength = textNode.textContent?.length ?? 0;
  let bestOffset = bestString?.hasAttribute('data-slate-zero-width') ? 1 : 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let offset = 0; offset <= textLength; offset++) {
    const candidate = getCollapsedTextOffsetRect(document, textNode, offset);
    const distance = candidate?.distanceX(x) ?? Number.POSITIVE_INFINITY;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestOffset = candidate?.offset ?? bestOffset;
    }
  }

  const range = document.createRange();

  range.setStart(textNode, Math.max(0, Math.min(bestOffset, textLength)));
  range.collapse(true);

  return resolvePointFromDOMRange(editor, range);
};

export const getPointAtCoordinates = (
  editor: ReactRuntimeEditor,
  x: number,
  y: number
): Point | null => {
  const { document } = editor.api.dom.getWindow();
  let domRange: globalThis.Range | null = null;

  if (document.caretRangeFromPoint) {
    domRange = document.caretRangeFromPoint(x, y);
  } else {
    const position = document.caretPositionFromPoint(x, y);

    if (position) {
      domRange = document.createRange();
      domRange.setStart(position.offsetNode, position.offset);
      domRange.setEnd(position.offsetNode, position.offset);
    }
  }

  return (
    (domRange ? resolvePointFromDOMRange(editor, domRange) : null) ??
    getPointNearCoordinatesFromSlateDOM(editor, x, y)
  );
};
