import {
  NodeApi,
  PathApi,
  type Point,
  PointApi,
  type Range,
} from '@platejs/slate';
import { DOMCoverage } from '@platejs/slate-dom/internal';

import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordSlateReactRender } from '../render-profiler';
import { Editor } from './runtime-editor-api';

type VerticalExtensionEvent = Pick<
  KeyboardEvent,
  'altKey' | 'ctrlKey' | 'key' | 'metaKey' | 'shiftKey'
>;

export const getPlainVerticalExtensionReverse = (
  event: VerticalExtensionEvent
) => {
  if (event.altKey || event.ctrlKey || event.metaKey || !event.shiftKey) {
    return null;
  }

  if (event.key === 'ArrowUp') {
    return true;
  }

  if (event.key === 'ArrowDown') {
    return false;
  }

  return null;
};

type PlainVerticalDOMCoverageExtension = {
  reverse: boolean;
  target: Point;
};

type RectLike = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};
type ResolvedDOMPoint = [globalThis.Node, number];

const VERTICAL_LINE_EDGE_TOLERANCE = 2;
const LARGE_DOCUMENT_PLAIN_VERTICAL_EXTENSION_THRESHOLD = 1000;

const measurePlainVerticalPhase = <T>(id: string, run: () => T): T => {
  if (!globalThis.__SLATE_REACT_RENDER_PROFILER__) {
    return run();
  }

  const startedAt = performance.now();

  try {
    return run();
  } finally {
    recordSlateReactRender({
      duration: performance.now() - startedAt,
      id,
      kind: 'runtime-time',
    });
  }
};

type DOMStrategyRuntimeLike = {
  mountedTopLevelRanges?: readonly { endIndex: number; startIndex: number }[];
  type?: unknown;
};

const getUsableRects = (range: globalThis.Range) =>
  Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 || rect.height > 0
  );

const getVisualLineRects = (range: globalThis.Range): RectLike[] => {
  const lines: RectLike[] = [];

  for (const rect of getUsableRects(range).sort(
    (left, right) => left.top - right.top || left.left - right.left
  )) {
    const line = lines.find((candidate) => {
      const overlap =
        Math.min(rect.bottom, candidate.bottom) -
        Math.max(rect.top, candidate.top);

      return overlap > VERTICAL_LINE_EDGE_TOLERANCE;
    });

    if (!line) {
      lines.push({
        bottom: rect.bottom,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: rect.width,
      });
      continue;
    }

    line.bottom = Math.max(line.bottom, rect.bottom);
    line.left = Math.min(line.left, rect.left);
    line.right = Math.max(line.right, rect.right);
    line.top = Math.min(line.top, rect.top);
    line.height = line.bottom - line.top;
    line.width = line.right - line.left;
  }

  return lines;
};

const getRenderedLineHostFromDOMPoint = (domPoint: ResolvedDOMPoint) => {
  const [node] = domPoint;
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;

  const textHost =
    element?.closest<HTMLElement>('[data-slate-node="text"]') ?? null;

  return (
    textHost?.closest<HTMLElement>(
      '[data-slate-node="element"][data-slate-path]'
    ) ?? textHost
  );
};

const getPointProbeRect = (domPoint: ResolvedDOMPoint) => {
  const [node, offset] = domPoint;

  if (node.nodeType !== Node.TEXT_NODE) {
    return node instanceof Element ? node.getBoundingClientRect() : null;
  }

  if (!node.ownerDocument) {
    return null;
  }

  const text = node.textContent ?? '';
  const range = node.ownerDocument.createRange();
  const start =
    offset >= text.length ? Math.max(0, text.length - 1) : Math.max(0, offset);
  const end =
    offset >= text.length
      ? text.length
      : Math.min(text.length, Math.max(offset + 1, 1));

  if (end <= start) {
    return null;
  }

  range.setStart(node, start);
  range.setEnd(node, end);

  return getUsableRects(range)[0] ?? range.getBoundingClientRect();
};

const getPointCaretRect = (domPoint: ResolvedDOMPoint) => {
  const [node, offset] = domPoint;

  if (node.nodeType !== Node.TEXT_NODE) {
    return getPointProbeRect(domPoint);
  }

  if (!node.ownerDocument) {
    return null;
  }

  const text = node.textContent ?? '';
  const range = node.ownerDocument.createRange();
  const caretOffset = clamp(offset, 0, text.length);

  range.setStart(node, caretOffset);
  range.collapse(true);

  return getUsableRects(range)[0] ?? range.getBoundingClientRect();
};

const resolvePointProbeRect = (editor: ReactRuntimeEditor, point: Point) => {
  const domPoint = editor.api.dom.resolveDOMPoint(point);

  return domPoint ? getPointProbeRect(domPoint) : null;
};

const resolvePointCaretRect = (editor: ReactRuntimeEditor, point: Point) => {
  const domPoint = editor.api.dom.resolveDOMPoint(point);

  return domPoint ? getPointCaretRect(domPoint) : null;
};

const isLeavingRenderedLine = ({
  editor,
  point,
  reverse,
}: {
  editor: ReactRuntimeEditor;
  point: Point;
  reverse: boolean;
}) => {
  try {
    const domPoint = editor.api.dom.resolveDOMPoint(point);

    if (!domPoint) {
      return true;
    }

    const lineHost = getRenderedLineHostFromDOMPoint(domPoint);

    if (!lineHost) {
      return true;
    }

    const range = lineHost.ownerDocument.createRange();
    range.selectNodeContents(lineHost);
    const lineRects = getVisualLineRects(range);

    if (lineRects.length <= 1) {
      return true;
    }

    const pointRect = getPointProbeRect(domPoint);

    if (!pointRect) {
      return true;
    }

    const pointMiddle = pointRect.top + pointRect.height / 2;
    const firstLine = lineRects[0];
    const lastLine = lineRects.at(-1);

    if (!firstLine || !lastLine) {
      return true;
    }

    return reverse
      ? pointMiddle <= firstLine.bottom + VERTICAL_LINE_EDGE_TOLERANCE
      : pointMiddle >= lastLine.top - VERTICAL_LINE_EDGE_TOLERANCE;
  } catch {
    return true;
  }
};

const isSameBlockPoint = ({
  editor,
  left,
  right,
}: {
  editor: ReactRuntimeEditor;
  left: Point;
  right: Point;
}) => {
  const leftBlock = Editor.above(editor, {
    at: left,
    match: (node) => NodeApi.isElement(node) && Editor.isBlock(editor, node),
  });
  const rightBlock = Editor.above(editor, {
    at: right,
    match: (node) => NodeApi.isElement(node) && Editor.isBlock(editor, node),
  });

  return (
    !!leftBlock && !!rightBlock && PathApi.equals(leftBlock[1], rightBlock[1])
  );
};

const resolveCaretDOMPointFromClientPoint = (
  document: Document,
  x: number,
  y: number
): ResolvedDOMPoint | null => {
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);

    return range ? [range.startContainer, range.startOffset] : null;
  }

  const position = document.caretPositionFromPoint?.(x, y);

  return position ? [position.offsetNode, position.offset] : null;
};

const isDOMPointInsideHost = (
  domPoint: ResolvedDOMPoint | null,
  host: HTMLElement
) => {
  if (!domPoint) {
    return false;
  }

  const [node] = domPoint;

  return node === host || host.contains(node);
};

const resolveDOMPointInVisualLineByX = ({
  lineHost,
  targetLine,
  targetX,
}: {
  lineHost: HTMLElement;
  targetLine: RectLike;
  targetX: number;
}): ResolvedDOMPoint | null => {
  const document = lineHost.ownerDocument;
  const direction =
    document.defaultView?.getComputedStyle(lineHost).direction ?? 'ltr';
  const targetPixelX = Math.floor(targetX);
  const range = document.createRange();
  const walker = document.createTreeWalker(lineHost, NodeFilter.SHOW_TEXT);
  let best: {
    distance: number;
    point: ResolvedDOMPoint;
  } | null = null;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';

    for (let offset = 0; offset < text.length; offset += 1) {
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);

      for (const rect of getUsableRects(range)) {
        const overlap =
          Math.min(rect.bottom, targetLine.bottom) -
          Math.max(rect.top, targetLine.top);

        if (overlap <= VERTICAL_LINE_EDGE_TOLERANCE) {
          continue;
        }

        if (targetPixelX >= rect.left && targetPixelX <= rect.right) {
          const midpoint = rect.left + rect.width / 2;
          const useStart =
            direction === 'rtl'
              ? targetPixelX > midpoint
              : targetPixelX <= midpoint;

          return useStart ? [node, offset] : [node, offset + 1];
        }

        const candidates: ResolvedDOMPoint[] = [
          [node, offset],
          [node, offset + 1],
        ];
        const candidateXs = [rect.left, rect.right];

        for (const [index, candidate] of candidates.entries()) {
          const distance = Math.abs(
            (candidateXs[index] ?? rect.left) - targetPixelX
          );

          if (!best || distance < best.distance) {
            best = { distance, point: candidate };
          }
        }
      }
    }
  }

  return best?.point ?? null;
};

const resolveTextOffsetInVisualLineByX = ({
  targetLine,
  targetX,
  textNode,
}: {
  targetLine: RectLike;
  targetX: number;
  textNode: Text;
}) => {
  const document = textNode.ownerDocument;
  const direction =
    document.defaultView?.getComputedStyle(textNode.parentElement!).direction ??
    'ltr';
  const targetPixelX = Math.floor(targetX);
  const range = document.createRange();
  const text = textNode.textContent ?? '';
  let best: {
    distance: number;
    offset: number;
  } | null = null;

  for (let offset = 0; offset < text.length; offset += 1) {
    range.setStart(textNode, offset);
    range.setEnd(textNode, offset + 1);

    for (const rect of getUsableRects(range)) {
      const overlap =
        Math.min(rect.bottom, targetLine.bottom) -
        Math.max(rect.top, targetLine.top);

      if (overlap <= VERTICAL_LINE_EDGE_TOLERANCE) {
        continue;
      }

      if (targetPixelX >= rect.left && targetPixelX <= rect.right) {
        const midpoint = rect.left + rect.width / 2;
        const useStart =
          direction === 'rtl'
            ? targetPixelX > midpoint
            : targetPixelX <= midpoint;

        return useStart ? offset : offset + 1;
      }

      const candidates = [
        { offset, x: rect.left },
        { offset: offset + 1, x: rect.right },
      ];

      for (const candidate of candidates) {
        const distance = Math.abs(candidate.x - targetPixelX);

        if (!best || distance < best.distance) {
          best = { distance, offset: candidate.offset };
        }
      }
    }
  }

  return best?.offset ?? null;
};

const resolveDOMPointAtVisualLineEdge = ({
  lineHost,
  reverse,
  targetLine,
}: {
  lineHost: HTMLElement;
  reverse: boolean;
  targetLine: RectLike;
}): ResolvedDOMPoint | null => {
  const document = lineHost.ownerDocument;
  const direction =
    document.defaultView?.getComputedStyle(lineHost).direction ?? 'ltr';
  const useLeftEdge = reverse ? direction !== 'rtl' : direction === 'rtl';
  const range = document.createRange();
  const walker = document.createTreeWalker(lineHost, NodeFilter.SHOW_TEXT);
  let best: {
    point: ResolvedDOMPoint;
    x: number;
  } | null = null;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';

    for (let offset = 0; offset < text.length; offset += 1) {
      range.setStart(node, offset);
      range.setEnd(node, offset + 1);

      for (const rect of getUsableRects(range)) {
        const overlap =
          Math.min(rect.bottom, targetLine.bottom) -
          Math.max(rect.top, targetLine.top);

        if (overlap <= VERTICAL_LINE_EDGE_TOLERANCE) {
          continue;
        }

        const candidate = useLeftEdge
          ? { point: [node, offset] as ResolvedDOMPoint, x: rect.left }
          : { point: [node, offset + 1] as ResolvedDOMPoint, x: rect.right };

        if (
          !best ||
          (useLeftEdge ? candidate.x < best.x : candidate.x > best.x)
        ) {
          best = candidate;
        }
      }
    }
  }

  return best?.point ?? null;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const clampPlainVerticalLargeDocumentTarget = ({
  reverse,
  selection,
  target,
}: {
  reverse: boolean;
  selection: Range;
  target: Point;
}) => {
  if (PointApi.equals(selection.anchor, selection.focus)) {
    return target;
  }

  const anchorBeforeFocus = PointApi.isBefore(
    selection.anchor,
    selection.focus
  );

  if (
    reverse &&
    anchorBeforeFocus &&
    !PointApi.isAfter(target, selection.anchor)
  ) {
    return selection.anchor;
  }

  if (
    !reverse &&
    !anchorBeforeFocus &&
    !PointApi.isBefore(target, selection.anchor)
  ) {
    return selection.anchor;
  }

  return target;
};

const isDirectionalPlainVerticalTarget = ({
  reverse,
  source,
  target,
}: {
  reverse: boolean;
  source: Point;
  target: Point;
}) =>
  reverse
    ? PointApi.isBefore(target, source)
    : PointApi.isAfter(target, source);

const createPlainVerticalLargeDocumentExtension = ({
  reverse,
  selection,
  target,
}: {
  reverse: boolean;
  selection: Range;
  target: Point;
}): PlainVerticalDOMCoverageExtension | null => {
  if (
    !isDirectionalPlainVerticalTarget({
      reverse,
      source: selection.focus,
      target,
    })
  ) {
    return null;
  }

  return {
    reverse,
    target: clampPlainVerticalLargeDocumentTarget({
      reverse,
      selection,
      target,
    }),
  };
};

const resolveVisualLineTargetPoint = ({
  editor,
  point,
  preferredXPoint,
  reverse,
}: {
  editor: ReactRuntimeEditor;
  point: Point;
  preferredXPoint?: Point | null;
  reverse: boolean;
}): Point | null => {
  try {
    const domPoint = editor.api.dom.resolveDOMPoint(point);

    if (!domPoint) {
      return null;
    }

    const lineHost = getRenderedLineHostFromDOMPoint(domPoint);

    if (!lineHost) {
      return null;
    }

    const pointRect = getPointProbeRect(domPoint);

    if (!pointRect) {
      return null;
    }

    const range = lineHost.ownerDocument.createRange();
    range.selectNodeContents(lineHost);
    const lineRects = getVisualLineRects(range);

    if (lineRects.length === 0) {
      return null;
    }

    const pointMiddle = pointRect.top + pointRect.height / 2;
    const currentLineIndex = lineRects.findIndex(
      (rect) => rect.top <= pointMiddle && rect.bottom >= pointMiddle
    );
    const currentLine =
      lineRects[currentLineIndex] ??
      (reverse ? lineRects[0] : lineRects.at(-1));

    if (!currentLine) {
      return null;
    }

    const preferredXRect =
      preferredXPoint && !PointApi.equals(preferredXPoint, point)
        ? resolvePointCaretRect(editor, preferredXPoint)
        : null;
    const targetLine = lineRects[
      reverse ? currentLineIndex - 1 : currentLineIndex + 1
    ] as DOMRect | undefined;
    const targetY = targetLine
      ? targetLine.top + targetLine.height / 2
      : reverse
        ? currentLine.top - Math.max(4, currentLine.height / 2)
        : currentLine.bottom + Math.max(4, currentLine.height / 2);

    const targetRect = targetLine ?? currentLine;
    const targetX = clamp(
      preferredXRect?.left ??
        resolvePointCaretRect(editor, point)?.left ??
        pointRect.left,
      targetRect.left + 1,
      Math.max(targetRect.left + 1, targetRect.right - 1)
    );
    const measuredDOMPoint = targetLine
      ? resolveDOMPointInVisualLineByX({
          lineHost,
          targetLine,
          targetX,
        })
      : null;
    const caretDOMPoint = measuredDOMPoint
      ? null
      : resolveCaretDOMPointFromClientPoint(
          lineHost.ownerDocument,
          targetX,
          targetY
        );
    const targetDOMPoint =
      measuredDOMPoint ??
      (isDOMPointInsideHost(caretDOMPoint, lineHost)
        ? caretDOMPoint
        : targetLine
          ? null
          : resolveDOMPointAtVisualLineEdge({
              lineHost,
              reverse,
              targetLine: currentLine,
            }));

    if (!targetDOMPoint) {
      return null;
    }

    const targetPoint = editor.api.dom.resolveSlatePoint(targetDOMPoint, {
      exactMatch: false,
    });

    if (!targetPoint) {
      return null;
    }

    if (PathApi.equals(targetPoint.path, point.path)) {
      if (targetPoint.offset === point.offset) {
        return null;
      }

      return targetPoint;
    }

    return targetPoint;
  } catch {
    return null;
  }
};

const getUnselectedMaterializeBoundariesForRange = ({
  editor,
  range,
  selectedBoundaryIds,
}: {
  editor: ReactRuntimeEditor;
  range: Range;
  selectedBoundaryIds: Set<string>;
}) =>
  DOMCoverage.getBoundariesForRange(editor, range).filter(
    (boundary) =>
      boundary.selectionPolicy === 'materialize' &&
      !selectedBoundaryIds.has(boundary.boundaryId)
  );

const isDOMStrategyRuntime = (
  domStrategyRuntime: unknown
): domStrategyRuntime is DOMStrategyRuntimeLike =>
  typeof domStrategyRuntime === 'object' &&
  domStrategyRuntime !== null &&
  ((domStrategyRuntime as DOMStrategyRuntimeLike).type === 'partial-dom' ||
    (domStrategyRuntime as DOMStrategyRuntimeLike).type === 'staged' ||
    (domStrategyRuntime as DOMStrategyRuntimeLike).type === 'virtualized');

const isPlainVerticalLargeDocumentSelection = ({
  domStrategyRuntime,
  editor,
  event,
  selection = editor.read((state) => state.selection.get()),
}: {
  domStrategyRuntime: unknown;
  editor: ReactRuntimeEditor;
  event: VerticalExtensionEvent;
  selection?: Range | null;
}) => {
  if (
    getPlainVerticalExtensionReverse(event) === null ||
    !selection ||
    !isDOMStrategyRuntime(domStrategyRuntime)
  ) {
    return false;
  }

  const topLevelCount = editor.read((state) => state.nodes.children().length);

  return topLevelCount >= LARGE_DOCUMENT_PLAIN_VERTICAL_EXTENSION_THRESHOLD;
};

export const isMountedPlainVerticalLargeDocumentMovement = ({
  domStrategyRuntime,
  editor,
  event,
  selection,
}: {
  domStrategyRuntime: unknown;
  editor?: ReactRuntimeEditor;
  event: VerticalExtensionEvent;
  selection?: Range | null;
}) => {
  const reverse = getPlainVerticalExtensionReverse(event);
  const runtime = domStrategyRuntime as DOMStrategyRuntimeLike | null;

  if (
    reverse === null ||
    !selection ||
    (runtime?.type !== 'staged' && runtime?.type !== 'virtualized')
  ) {
    return false;
  }

  const focusIndex = selection.focus.path[0];
  const mountedRanges = runtime.mountedTopLevelRanges;

  if (typeof focusIndex !== 'number' || !mountedRanges?.length) {
    return false;
  }

  const sortedRanges = [...mountedRanges].sort(
    (left, right) => left.startIndex - right.startIndex
  );
  const currentRangeIndex = sortedRanges.findIndex(
    (range) => range.startIndex <= focusIndex && range.endIndex >= focusIndex
  );
  const currentRange = sortedRanges[currentRangeIndex];

  if (!currentRange) {
    return false;
  }

  if (reverse) {
    if (focusIndex > currentRange.startIndex) {
      return true;
    }
  } else if (focusIndex < currentRange.endIndex) {
    return true;
  }

  return editor
    ? !isLeavingRenderedLine({
        editor,
        point: selection.focus,
        reverse,
      })
    : false;
};

const getSingleTextPointInTopLevelBlock = ({
  blockIndex,
  editor,
  offset,
}: {
  blockIndex: number;
  editor: ReactRuntimeEditor;
  offset: number;
}): Point | null =>
  editor.read((state) => {
    const children = state.nodes.children();

    if (blockIndex < 0 || blockIndex >= children.length) {
      return null;
    }

    const [block] = state.nodes.get([blockIndex]);
    const textEntries = Array.from(NodeApi.texts(block));

    if (textEntries.length !== 1) {
      return null;
    }

    const [textNode, relativePath] = textEntries[0]!;

    return {
      path: [blockIndex, ...relativePath],
      offset: Math.min(offset, textNode.text.length),
    };
  });

const getSingleTextInTopLevelBlock = ({
  blockIndex,
  editor,
}: {
  blockIndex: number;
  editor: ReactRuntimeEditor;
}): { path: Point['path']; text: string } | null =>
  editor.read((state) => {
    const children = state.nodes.children();

    if (blockIndex < 0 || blockIndex >= children.length) {
      return null;
    }

    const [block] = state.nodes.get([blockIndex]);
    const textEntries = Array.from(NodeApi.texts(block));

    if (textEntries.length !== 1) {
      return null;
    }

    const [textNode, relativePath] = textEntries[0]!;

    return {
      path: [blockIndex, ...relativePath],
      text: textNode.text,
    };
  });

const copyTextMeasureStyles = (from: HTMLElement, to: HTMLElement) => {
  const style = from.ownerDocument.defaultView?.getComputedStyle(from);

  if (!style) {
    return;
  }

  to.style.boxSizing = 'border-box';
  to.style.font = style.font;
  to.style.letterSpacing = style.letterSpacing;
  to.style.lineHeight = style.lineHeight;
  to.style.overflowWrap = style.overflowWrap;
  to.style.padding = style.padding;
  to.style.textTransform = style.textTransform;
  to.style.whiteSpace = style.whiteSpace;
  to.style.wordBreak = style.wordBreak;
  to.style.wordSpacing = style.wordSpacing;
};

const resolveMeasuredAdjacentBlockVisualLineTargetPoint = ({
  blockIndex,
  editor,
  preferredXPoint,
  reverse,
  sourceLineHost,
  sourcePoint,
}: {
  blockIndex: number;
  editor: ReactRuntimeEditor;
  preferredXPoint?: Point | null;
  reverse: boolean;
  sourceLineHost: HTMLElement;
  sourcePoint: Point;
}): Point | null => {
  const adjacentText = getSingleTextInTopLevelBlock({ blockIndex, editor });

  if (!adjacentText) {
    return null;
  }

  const preferredXRect =
    preferredXPoint && !PointApi.equals(preferredXPoint, sourcePoint)
      ? resolvePointCaretRect(editor, preferredXPoint)
      : null;
  const sourceRect = resolvePointProbeRect(editor, sourcePoint);
  const sourceCaretRect = resolvePointCaretRect(editor, sourcePoint);

  if (!preferredXRect && !sourceCaretRect && !sourceRect) {
    return null;
  }

  const document = sourceLineHost.ownerDocument;
  const probe = document.createElement(sourceLineHost.tagName.toLowerCase());
  const textNode = document.createTextNode(adjacentText.text);
  const sourceRectHost = sourceLineHost.getBoundingClientRect();

  copyTextMeasureStyles(sourceLineHost, probe);
  probe.style.contain = 'layout style paint';
  probe.style.left = `${sourceRectHost.left}px`;
  probe.style.pointerEvents = 'none';
  probe.style.position = 'fixed';
  probe.style.top = '0';
  probe.style.visibility = 'hidden';
  probe.style.width = `${sourceRectHost.width}px`;
  probe.appendChild(textNode);
  document.body.appendChild(probe);

  try {
    const range = document.createRange();
    range.selectNodeContents(probe);
    const lineRects = getVisualLineRects(range);
    const targetLine = reverse ? lineRects.at(-1) : lineRects[0];

    if (!targetLine) {
      return null;
    }

    const targetX = clamp(
      preferredXRect?.left ?? sourceCaretRect?.left ?? sourceRect!.left,
      targetLine.left + 1,
      Math.max(targetLine.left + 1, targetLine.right - 1)
    );
    const offset = resolveTextOffsetInVisualLineByX({
      targetLine,
      targetX,
      textNode,
    });

    return typeof offset === 'number'
      ? {
          path: adjacentText.path,
          offset,
        }
      : null;
  } finally {
    probe.remove();
  }
};

const resolveAdjacentBlockVisualLineTargetPoint = ({
  blockIndex,
  editor,
  preferredXPoint,
  reverse,
  sourcePoint,
}: {
  blockIndex: number;
  editor: ReactRuntimeEditor;
  preferredXPoint?: Point | null;
  reverse: boolean;
  sourcePoint: Point;
}): Point | null => {
  const adjacentPoint = getSingleTextPointInTopLevelBlock({
    blockIndex,
    editor,
    offset: 0,
  });

  if (!adjacentPoint) {
    return null;
  }

  try {
    const sourceDOMPoint = editor.api.dom.resolveDOMPoint(sourcePoint);
    const sourceLineHost = sourceDOMPoint
      ? getRenderedLineHostFromDOMPoint(sourceDOMPoint)
      : null;
    const adjacentDOMPoint = editor.api.dom.resolveDOMPoint(adjacentPoint);

    if (!adjacentDOMPoint) {
      return sourceLineHost
        ? resolveMeasuredAdjacentBlockVisualLineTargetPoint({
            blockIndex,
            editor,
            preferredXPoint,
            reverse,
            sourceLineHost,
            sourcePoint,
          })
        : null;
    }

    const lineHost = getRenderedLineHostFromDOMPoint(adjacentDOMPoint);

    if (!lineHost) {
      return null;
    }

    const range = lineHost.ownerDocument.createRange();
    range.selectNodeContents(lineHost);
    const lineRects = getVisualLineRects(range);
    const targetLine = reverse ? lineRects.at(-1) : lineRects[0];

    if (!targetLine) {
      return null;
    }

    const preferredXRect =
      preferredXPoint && !PointApi.equals(preferredXPoint, sourcePoint)
        ? resolvePointCaretRect(editor, preferredXPoint)
        : null;
    const sourceRect = resolvePointProbeRect(editor, sourcePoint);
    const sourceCaretRect = resolvePointCaretRect(editor, sourcePoint);

    if (!preferredXRect && !sourceCaretRect && !sourceRect) {
      return null;
    }

    const targetX = clamp(
      preferredXRect?.left ?? sourceCaretRect?.left ?? sourceRect!.left,
      targetLine.left + 1,
      Math.max(targetLine.left + 1, targetLine.right - 1)
    );
    const targetY = targetLine.top + targetLine.height / 2;
    const measuredDOMPoint = resolveDOMPointInVisualLineByX({
      lineHost,
      targetLine,
      targetX,
    });
    const caretDOMPoint = measuredDOMPoint
      ? null
      : resolveCaretDOMPointFromClientPoint(
          lineHost.ownerDocument,
          targetX,
          targetY
        );
    const targetDOMPoint =
      measuredDOMPoint ??
      (isDOMPointInsideHost(caretDOMPoint, lineHost) ? caretDOMPoint : null);

    if (!targetDOMPoint) {
      return sourceLineHost
        ? resolveMeasuredAdjacentBlockVisualLineTargetPoint({
            blockIndex,
            editor,
            preferredXPoint,
            reverse,
            sourceLineHost,
            sourcePoint,
          })
        : null;
    }

    return editor.api.dom.resolveSlatePoint(targetDOMPoint, {
      exactMatch: false,
    });
  } catch {
    return null;
  }
};

export const getPlainVerticalLargeDocumentExtension = ({
  domStrategyRuntime,
  editor,
  event,
  forceModelMovement = false,
  selection = editor.read((state) => state.selection.get()),
}: {
  domStrategyRuntime: unknown;
  editor: ReactRuntimeEditor;
  event: VerticalExtensionEvent;
  forceModelMovement?: boolean;
  selection?: Range | null;
}): PlainVerticalDOMCoverageExtension | null => {
  const reverse = getPlainVerticalExtensionReverse(event);

  if (
    reverse === null ||
    !selection ||
    !isPlainVerticalLargeDocumentSelection({
      domStrategyRuntime,
      editor,
      event,
      selection,
    })
  ) {
    return null;
  }

  const focusBlockIndex = selection.focus.path[0];

  if (typeof focusBlockIndex !== 'number') {
    return null;
  }

  const getAdjacentBlockExtension = () => {
    const target = getSingleTextPointInTopLevelBlock({
      blockIndex: reverse ? focusBlockIndex - 1 : focusBlockIndex + 1,
      editor,
      offset: selection.focus.offset,
    });

    return target
      ? createPlainVerticalLargeDocumentExtension({
          reverse,
          selection,
          target,
        })
      : null;
  };
  const mountedRangeEdge =
    (domStrategyRuntime as DOMStrategyRuntimeLike).mountedTopLevelRanges?.some(
      (range) =>
        range.startIndex <= focusBlockIndex &&
        range.endIndex >= focusBlockIndex &&
        (reverse
          ? focusBlockIndex === range.startIndex
          : focusBlockIndex === range.endIndex)
    ) ?? false;
  const leavingRenderedLine = measurePlainVerticalPhase(
    'plain-vertical.is-leaving-rendered-line',
    () =>
      isLeavingRenderedLine({
        editor,
        point: selection.focus,
        reverse,
      })
  );
  const preferredXPoint = PointApi.equals(selection.anchor, selection.focus)
    ? null
    : selection.anchor;
  const visualTarget = measurePlainVerticalPhase(
    'plain-vertical.resolve-visual-target',
    () =>
      resolveVisualLineTargetPoint({
        editor,
        point: selection.focus,
        preferredXPoint,
        reverse,
      })
  );
  const visualTargetIsDirectional =
    visualTarget &&
    isDirectionalPlainVerticalTarget({
      reverse,
      source: selection.focus,
      target: visualTarget,
    });
  const visualTargetStaysInFocusBlock =
    typeof visualTarget?.path[0] === 'number' &&
    visualTarget.path[0] === focusBlockIndex;

  if (visualTargetIsDirectional && !leavingRenderedLine) {
    return createPlainVerticalLargeDocumentExtension({
      reverse,
      selection,
      target: visualTarget,
    });
  }

  const adjacentVisualTarget = leavingRenderedLine
    ? measurePlainVerticalPhase(
        'plain-vertical.resolve-adjacent-visual-target',
        () =>
          resolveAdjacentBlockVisualLineTargetPoint({
            blockIndex: reverse ? focusBlockIndex - 1 : focusBlockIndex + 1,
            editor,
            preferredXPoint,
            reverse,
            sourcePoint: selection.focus,
          })
      )
    : null;

  if (
    adjacentVisualTarget &&
    isDirectionalPlainVerticalTarget({
      reverse,
      source: selection.focus,
      target: adjacentVisualTarget,
    })
  ) {
    return createPlainVerticalLargeDocumentExtension({
      reverse,
      selection,
      target: adjacentVisualTarget,
    });
  }

  if (
    visualTargetIsDirectional &&
    (!leavingRenderedLine || !visualTargetStaysInFocusBlock)
  ) {
    return createPlainVerticalLargeDocumentExtension({
      reverse,
      selection,
      target: visualTarget,
    });
  }

  const currentFocus = getSingleTextPointInTopLevelBlock({
    blockIndex: focusBlockIndex,
    editor,
    offset: selection.focus.offset,
  });

  if (
    currentFocus &&
    PathApi.equals(currentFocus.path, selection.focus.path) &&
    leavingRenderedLine
  ) {
    const adjacentBlockExtension = getAdjacentBlockExtension();

    if (adjacentBlockExtension) {
      return adjacentBlockExtension;
    }
  }

  const modelLineTarget = measurePlainVerticalPhase(
    'plain-vertical.resolve-model-line-target',
    () =>
      reverse
        ? Editor.before(editor, selection.focus, { unit: 'line' })
        : Editor.after(editor, selection.focus, { unit: 'line' })
  );

  const modelLineTargetIsDirectional =
    modelLineTarget &&
    isDirectionalPlainVerticalTarget({
      reverse,
      source: selection.focus,
      target: modelLineTarget,
    });

  if (modelLineTargetIsDirectional) {
    if (forceModelMovement) {
      return createPlainVerticalLargeDocumentExtension({
        reverse,
        selection,
        target: modelLineTarget,
      });
    }

    if (mountedRangeEdge && leavingRenderedLine) {
      const adjacentVisualTarget = resolveAdjacentBlockVisualLineTargetPoint({
        blockIndex: reverse ? focusBlockIndex - 1 : focusBlockIndex + 1,
        editor,
        preferredXPoint,
        reverse,
        sourcePoint: selection.focus,
      });

      return createPlainVerticalLargeDocumentExtension({
        reverse,
        selection,
        target: adjacentVisualTarget ?? modelLineTarget,
      });
    }

    if (leavingRenderedLine && modelLineTarget.path[0] === focusBlockIndex) {
      return getAdjacentBlockExtension();
    }

    return createPlainVerticalLargeDocumentExtension({
      reverse,
      selection,
      target: modelLineTarget,
    });
  }

  const getModelLineExtension = () => {
    if (
      typeof modelLineTarget?.path[0] === 'number' &&
      modelLineTarget.path[0] !== focusBlockIndex
    ) {
      return null;
    }

    return modelLineTarget
      ? createPlainVerticalLargeDocumentExtension({
          reverse,
          selection,
          target: modelLineTarget,
        })
      : null;
  };

  if (
    !currentFocus ||
    !PathApi.equals(currentFocus.path, selection.focus.path)
  ) {
    return getModelLineExtension();
  }

  if (leavingRenderedLine) {
    return getAdjacentBlockExtension() ?? getModelLineExtension();
  }

  return getModelLineExtension() ?? getAdjacentBlockExtension();
};

export const getPlainVerticalDOMCoverageExtension = ({
  editor,
  event,
  selection = editor.read((state) => state.selection.get()),
}: {
  editor: ReactRuntimeEditor;
  event: VerticalExtensionEvent;
  selection?: Range | null;
}): PlainVerticalDOMCoverageExtension | null => {
  const reverse = getPlainVerticalExtensionReverse(event);

  if (reverse === null || !selection) {
    return null;
  }

  const nextFocus = reverse
    ? Editor.before(editor, selection.focus, { unit: 'line' })
    : Editor.after(editor, selection.focus, { unit: 'line' });

  if (!nextFocus) {
    return null;
  }

  const selectedBoundaryIds = new Set(
    DOMCoverage.getBoundariesForRange(editor, selection).map(
      (boundary) => boundary.boundaryId
    )
  );
  const focusMovementRange = {
    anchor: selection.focus,
    focus: nextFocus,
  };

  if (
    getUnselectedMaterializeBoundariesForRange({
      editor,
      range: focusMovementRange,
      selectedBoundaryIds,
    }).length > 0
  ) {
    return { reverse, target: nextFocus };
  }

  if (
    !isSameBlockPoint({ editor, left: selection.focus, right: nextFocus }) ||
    !isLeavingRenderedLine({ editor, point: selection.focus, reverse })
  ) {
    return null;
  }

  const boundaryFocus = reverse
    ? Editor.before(editor, nextFocus, { unit: 'line' })
    : Editor.after(editor, nextFocus, { unit: 'line' });

  if (!boundaryFocus) {
    return null;
  }

  const boundaryMovementRange = {
    anchor: nextFocus,
    focus: boundaryFocus,
  };

  return getUnselectedMaterializeBoundariesForRange({
    editor,
    range: boundaryMovementRange,
    selectedBoundaryIds,
  }).length > 0
    ? { reverse, target: boundaryFocus }
    : null;
};

export const shouldModelOwnPlainVerticalDOMCoverageExtension = ({
  editor,
  event,
  selection,
}: {
  editor: ReactRuntimeEditor;
  event: VerticalExtensionEvent;
  selection?: Range | null;
}) =>
  getPlainVerticalDOMCoverageExtension({
    editor,
    event,
    selection,
  }) !== null;

export const shouldModelOwnPlainVerticalLargeDocumentExtension = ({
  domStrategyRuntime,
  editor,
  event,
  selection,
}: {
  domStrategyRuntime: unknown;
  editor: ReactRuntimeEditor;
  event: VerticalExtensionEvent;
  selection?: Range | null;
}) =>
  isPlainVerticalLargeDocumentSelection({
    domStrategyRuntime,
    editor,
    event,
    selection,
  });
