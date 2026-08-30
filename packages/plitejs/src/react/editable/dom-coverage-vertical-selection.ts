import { NodeApi, PathApi, type Point, PointApi, type Range } from '../..';
import {
  createDOMGeometryKernel,
  DOMCoverage,
  type DOMGeometryPoint,
  type DOMGeometryRect,
} from '../../dom/internal';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { recordPliteReactRender } from '../render-profiler';
import {
  above as editorAbove,
  failInvariant,
  isBlock as editorIsBlock,
  before as editorBefore,
  getSelection as getEditorSelection,
  after as editorAfter,
  getSelectionDOMRange,
} from './runtime-editor-api';

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

type RectLike = DOMGeometryRect;
type ResolvedDOMPoint = DOMGeometryPoint;

const VERTICAL_LINE_EDGE_TOLERANCE = 2;
const LARGE_DOCUMENT_PLAIN_VERTICAL_EXTENSION_THRESHOLD = 1000;

const measurePlainVerticalPhase = <T>(id: string, run: () => T): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return run();
  }

  const startedAt = performance.now();

  try {
    return run();
  } finally {
    recordPliteReactRender({
      duration: performance.now() - startedAt,
      id,
      kind: 'runtime-time',
    });
  }
};

type DOMStrategyRuntimeLike = {
  mountedTopLevelRanges?: ReadonlyArray<{
    endIndex: number;
    startIndex: number;
  }>;
  type?: unknown;
};

const getEditorGeometry = (
  editor: ReactRuntimeEditor,
  target?: Element | null
) => {
  const root = editor.api.dom.root() ?? editor.api.dom.resolveDOMNode(editor);

  return root ? createDOMGeometryKernel({ root, target }) : null;
};

const getVisualLineRects = (
  editor: ReactRuntimeEditor,
  range: globalThis.Range
): RectLike[] => getEditorGeometry(editor)?.visualLines(range) ?? [];

const getRenderedLineHostFromDOMPoint = (
  editor: ReactRuntimeEditor,
  domPoint: ResolvedDOMPoint
) => getEditorGeometry(editor)?.visualLineHost(domPoint) ?? null;

const getPointProbeRect = (
  editor: ReactRuntimeEditor,
  domPoint: ResolvedDOMPoint
) => getEditorGeometry(editor)?.pointRect(domPoint, { mode: 'probe' }) ?? null;

const getPointCaretRect = (
  editor: ReactRuntimeEditor,
  domPoint: ResolvedDOMPoint
) => getEditorGeometry(editor)?.pointRect(domPoint) ?? null;

const resolvePointProbeRect = (editor: ReactRuntimeEditor, point: Point) => {
  const domPoint = editor.api.dom.resolveDOMPoint(point);

  return domPoint ? getPointProbeRect(editor, domPoint) : null;
};

const resolvePointCaretRect = (editor: ReactRuntimeEditor, point: Point) => {
  const domPoint = editor.api.dom.resolveDOMPoint(point);

  return domPoint ? getPointCaretRect(editor, domPoint) : null;
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

    const lineHost = getRenderedLineHostFromDOMPoint(editor, domPoint);

    if (!lineHost) {
      return true;
    }

    const range = lineHost.ownerDocument.createRange();
    range.selectNodeContents(lineHost);
    const lineRects = getVisualLineRects(editor, range);

    if (lineRects.length <= 1) {
      return true;
    }

    const pointRect = getPointProbeRect(editor, domPoint);

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
  const leftBlock = editorAbove(editor, {
    at: left,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
  });
  const rightBlock = editorAbove(editor, {
    at: right,
    match: (node) => NodeApi.isElement(node) && editorIsBlock(editor, node),
  });

  return (
    !!leftBlock && !!rightBlock && PathApi.equals(leftBlock[1], rightBlock[1])
  );
};

const resolveDOMPointInVisualLineByX = ({
  editor,
  lineHost,
  targetLine,
  targetX,
}: {
  editor: ReactRuntimeEditor;
  lineHost: HTMLElement;
  targetLine: RectLike;
  targetX: number;
}): ResolvedDOMPoint | null =>
  getEditorGeometry(editor, lineHost)?.pointInVisualLine({
    host: lineHost,
    line: targetLine,
    x: targetX,
  }) ?? null;

const resolveDOMPointAtVisualLineEdge = ({
  editor,
  lineHost,
  reverse,
  targetLine,
}: {
  editor: ReactRuntimeEditor;
  lineHost: HTMLElement;
  reverse: boolean;
  targetLine: RectLike;
}): ResolvedDOMPoint | null =>
  getEditorGeometry(editor, lineHost)?.pointAtVisualLineEdge({
    edge: reverse ? 'start' : 'end',
    host: lineHost,
    line: targetLine,
  }) ?? null;

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
  preferredX,
  preferredXPoint,
  reverse,
}: {
  editor: ReactRuntimeEditor;
  point: Point;
  preferredX?: number;
  preferredXPoint?: Point | null;
  reverse: boolean;
}): Point | null => {
  try {
    const domPoint = editor.api.dom.resolveDOMPoint(point);

    if (!domPoint) {
      return null;
    }

    const lineHost = getRenderedLineHostFromDOMPoint(editor, domPoint);

    if (!lineHost) {
      return null;
    }

    const pointRect = getPointProbeRect(editor, domPoint);

    if (!pointRect) {
      return null;
    }

    const range = lineHost.ownerDocument.createRange();
    range.selectNodeContents(lineHost);
    const lineRects = getVisualLineRects(editor, range);

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
    ] as RectLike | undefined;

    const targetRect = targetLine ?? currentLine;
    const targetX = clamp(
      preferredX ??
        preferredXRect?.left ??
        resolvePointCaretRect(editor, point)?.left ??
        pointRect.left,
      targetRect.left + 1,
      Math.max(targetRect.left + 1, targetRect.right - 1)
    );
    const targetDOMPoint = targetLine
      ? resolveDOMPointInVisualLineByX({
          editor,
          lineHost,
          targetLine,
          targetX,
        })
      : resolveDOMPointAtVisualLineEdge({
          editor,
          lineHost,
          reverse,
          targetLine: currentLine,
        });

    if (!targetDOMPoint) {
      return null;
    }

    const targetPoint = editor.api.dom.resolvePlitePoint(
      [targetDOMPoint[0], targetDOMPoint[1]],
      { exactMatch: false }
    );

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
  selection = getSelectionDOMRange(editor, getEditorSelection(editor)),
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

    const block = children[blockIndex];
    const textEntries = Array.from(NodeApi.texts(block));

    if (textEntries.length !== 1) {
      return null;
    }

    const [textNode, relativePath] = textEntries[0];

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

    const block = children[blockIndex];
    const textEntries = Array.from(NodeApi.texts(block));

    if (textEntries.length !== 1) {
      return null;
    }

    const [textNode, relativePath] = textEntries[0];

    return {
      path: [blockIndex, ...relativePath],
      text: textNode.text,
    };
  });

const resolveMeasuredAdjacentBlockVisualLineTargetPoint = ({
  blockIndex,
  editor,
  preferredX,
  preferredXPoint,
  reverse,
  sourceLineHost,
  sourcePoint,
}: {
  blockIndex: number;
  editor: ReactRuntimeEditor;
  preferredX?: number;
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

  if (
    preferredX == null &&
    !preferredXRect &&
    !sourceCaretRect &&
    !sourceRect
  ) {
    return null;
  }

  const offset = getEditorGeometry(
    editor,
    sourceLineHost
  )?.measureTextVisualLineOffset({
    edge: reverse ? 'end' : 'start',
    sourceHost: sourceLineHost,
    text: adjacentText.text,
    x:
      preferredX ??
      preferredXRect?.left ??
      sourceCaretRect?.left ??
      (sourceRect ?? failInvariant('Expected value to be defined')).left,
  });

  return typeof offset === 'number'
    ? { path: adjacentText.path, offset }
    : null;
};

const resolveAdjacentBlockVisualLineTargetPoint = ({
  blockIndex,
  editor,
  preferredX,
  preferredXPoint,
  reverse,
  sourcePoint,
}: {
  blockIndex: number;
  editor: ReactRuntimeEditor;
  preferredX?: number;
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
      ? getRenderedLineHostFromDOMPoint(editor, sourceDOMPoint)
      : null;
    const adjacentDOMPoint = editor.api.dom.resolveDOMPoint(adjacentPoint);

    if (!adjacentDOMPoint) {
      return sourceLineHost
        ? resolveMeasuredAdjacentBlockVisualLineTargetPoint({
            blockIndex,
            editor,
            preferredX,
            preferredXPoint,
            reverse,
            sourceLineHost,
            sourcePoint,
          })
        : null;
    }

    const lineHost = getRenderedLineHostFromDOMPoint(editor, adjacentDOMPoint);

    if (!lineHost) {
      return null;
    }

    const range = lineHost.ownerDocument.createRange();
    range.selectNodeContents(lineHost);
    const lineRects = getVisualLineRects(editor, range);
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

    if (
      preferredX == null &&
      !preferredXRect &&
      !sourceCaretRect &&
      !sourceRect
    ) {
      return null;
    }

    const targetX = clamp(
      preferredX ??
        preferredXRect?.left ??
        sourceCaretRect?.left ??
        (sourceRect ?? failInvariant('Expected value to be defined')).left,
      targetLine.left + 1,
      Math.max(targetLine.left + 1, targetLine.right - 1)
    );
    const targetDOMPoint = resolveDOMPointInVisualLineByX({
      editor,
      lineHost,
      targetLine,
      targetX,
    });

    if (!targetDOMPoint) {
      return sourceLineHost
        ? resolveMeasuredAdjacentBlockVisualLineTargetPoint({
            blockIndex,
            editor,
            preferredX,
            preferredXPoint,
            reverse,
            sourceLineHost,
            sourcePoint,
          })
        : null;
    }

    return editor.api.dom.resolvePlitePoint(
      [targetDOMPoint[0], targetDOMPoint[1]],
      { exactMatch: false }
    );
  } catch {
    return null;
  }
};

export const getPlainVerticalLargeDocumentExtension = ({
  domStrategyRuntime,
  editor,
  event,
  forceModelMovement = false,
  preferredX,
  selection = getSelectionDOMRange(editor, getEditorSelection(editor)),
}: {
  domStrategyRuntime: unknown;
  editor: ReactRuntimeEditor;
  event: VerticalExtensionEvent;
  forceModelMovement?: boolean;
  preferredX?: number;
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
        preferredX,
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
            preferredX,
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
        ? editorBefore(editor, selection.focus, { unit: 'line' })
        : editorAfter(editor, selection.focus, { unit: 'line' })
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
      const innerAdjacentVisualTarget =
        resolveAdjacentBlockVisualLineTargetPoint({
          blockIndex: reverse ? focusBlockIndex - 1 : focusBlockIndex + 1,
          editor,
          preferredX,
          preferredXPoint,
          reverse,
          sourcePoint: selection.focus,
        });

      return createPlainVerticalLargeDocumentExtension({
        reverse,
        selection,
        target: innerAdjacentVisualTarget ?? modelLineTarget,
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
  selection = getSelectionDOMRange(editor, getEditorSelection(editor)),
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
    ? editorBefore(editor, selection.focus, { unit: 'line' })
    : editorAfter(editor, selection.focus, { unit: 'line' });

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
    ? editorBefore(editor, nextFocus, { unit: 'line' })
    : editorAfter(editor, nextFocus, { unit: 'line' });

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
