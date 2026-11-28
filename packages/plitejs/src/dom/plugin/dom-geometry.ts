import { failInvariant } from '../../internal/fail-invariant';
import { isDOMHTMLElement, isDOMText } from '../utils/dom';
import { resolveDOMTextFlowStringOffset } from './dom-text-flow-index';

const CSS_BREAK_WHITESPACE_PATTERN = /^[\t\n\f\r ]+$/;
const BLOCK_EDGE_HIT_SLOP = 16;
const STRING_EDGE_HIT_SLOP = 3;
const VISUAL_LINE_TOLERANCE = 2;
const VERTICAL_NAVIGATION_CARET_WIDTH = 1;

export type DOMGeometryAssociation = 'backward' | 'forward';

export type DOMGeometryPoint = readonly [globalThis.Node, number];

/** Plain bounding rectangle with viewport coordinates and dimensions. */
export type DOMGeometryRect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

export const PLITE_STRING_PRESS_REACH_PX = 16;

export type PliteStringLetterPlacement =
  NonNullable<PliteStringCoordinatePlacement> &
    Readonly<{ overLetterBefore: boolean }>;

export type PliteStringCoordinatePlacement = {
  edge: 'end' | 'start';
  offset?: number;
  rect: DOMRect;
  source: 'root-edge' | 'string-edge' | 'string-offset';
  string: HTMLElement;
} | null;

type PliteStringRectCandidate = {
  rect: DOMRect;
  string: HTMLElement;
  verticalCenterDistance: number;
  verticalDistance: number;
};

export const getRectVerticalDistance = (rect: DOMRect, y: number) =>
  y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;

export const getRectVerticalCenterDistance = (rect: DOMRect, y: number) =>
  Math.abs(rect.top + rect.height / 2 - y);

export const getRectHorizontalDistance = (rect: DOMRect, x: number) =>
  x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;

export const getVerticalNavigationCaretX = ({
  boundaryX,
  containerX,
}: {
  boundaryX: number;
  containerX: number;
}) =>
  containerX +
  Math.round(boundaryX - containerX - VERTICAL_NAVIGATION_CARET_WIDTH / 2);

const getPliteStringRectCandidates = ({
  event,
  strings,
}: {
  event: Pick<MouseEvent, 'clientY'>;
  strings: HTMLElement[];
}): PliteStringRectCandidate[] =>
  strings.flatMap((string) => {
    const rects = Array.from(string.getClientRects()).filter(
      (rect) => rect.width > 0 || rect.height > 0
    );

    return rects.map((rect) => ({
      rect,
      string,
      verticalCenterDistance: getRectVerticalCenterDistance(
        rect,
        event.clientY
      ),
      verticalDistance: getRectVerticalDistance(rect, event.clientY),
    }));
  });

export const getPliteStringDirection = (string: HTMLElement) => {
  const textHost = string.closest<HTMLElement>('[data-editor-node="text"]');
  const element =
    textHost?.closest<HTMLElement>('[data-editor-node="element"]') ??
    textHost ??
    string;
  const view = string.ownerDocument.defaultView;
  const computedDirection = view?.getComputedStyle(element).direction;
  const declaredDirection =
    element.style.direction || element.getAttribute('dir');

  return computedDirection === 'rtl' ||
    (computedDirection !== 'ltr' && declaredDirection === 'rtl')
    ? 'rtl'
    : 'ltr';
};

export const getLogicalEdgeFromPhysicalEdge = (
  string: HTMLElement,
  physicalEdge: 'left' | 'right'
) => {
  const direction = getPliteStringDirection(string);

  if (direction === 'rtl') {
    return physicalEdge === 'left' ? 'end' : 'start';
  }

  return physicalEdge === 'left' ? 'start' : 'end';
};

const getPhysicalEdgeFromLogicalEdge = (
  string: HTMLElement,
  logicalEdge: 'end' | 'start'
) => {
  const direction = getPliteStringDirection(string);

  if (direction === 'rtl') {
    return logicalEdge === 'start' ? 'right' : 'left';
  }

  return logicalEdge === 'start' ? 'left' : 'right';
};

export const getPliteStringLength = (string: HTMLElement) => {
  const lengthAttribute = string.getAttribute('data-editor-length');
  const length =
    lengthAttribute === null ? null : Number.parseInt(lengthAttribute, 10);

  if (length !== null && Number.isFinite(length)) {
    return length;
  }

  if (string.hasAttribute('data-editor-zero-width')) {
    return 0;
  }

  return string.textContent?.length ?? 0;
};

export const PLITE_STRING_SELECTOR =
  '[data-editor-string], [data-editor-zero-width]';

export const getPliteTextHostStrings = (textHost: Element): HTMLElement[] => {
  if (isDOMHTMLElement(textHost) && textHost.matches(PLITE_STRING_SELECTOR)) {
    return [textHost];
  }
  const owner = textHost.closest('[data-editor-node="text"]');
  return Array.from(
    textHost.querySelectorAll<HTMLElement>(PLITE_STRING_SELECTOR)
  ).filter((string) => string.closest('[data-editor-node="text"]') === owner);
};

export const getPliteTextHostBounds = (textHost: Element) => {
  const leaves = [
    ...textHost.querySelectorAll('[data-editor-leaf-start]'),
  ].filter((leaf) => leaf.closest('[data-editor-node="text"]') === textHost);
  return {
    end: Number(
      leaves.at(-1)?.getAttribute('data-editor-leaf-end') ?? Infinity
    ),
    start: Number(leaves[0]?.getAttribute('data-editor-leaf-start') ?? 0),
  };
};

const graphemeSegmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

const getGraphemeBoundaryOffsets = (text: string) => {
  if (graphemeSegmenter) {
    return [
      0,
      ...Array.from(
        graphemeSegmenter.segment(text),
        ({ index, segment }) => index + segment.length
      ),
    ];
  }

  let offset = 0;

  return [
    0,
    ...Array.from(text, (character) => {
      offset += character.length;

      return offset;
    }),
  ];
};

export const getUsableRangeRects = (range: globalThis.Range): DOMRect[] => {
  const hasRect = (rect: DOMRect | null): rect is DOMRect =>
    !!rect && (rect.width > 0 || rect.height > 0);
  const clientRects =
    typeof range.getClientRects === 'function'
      ? Array.from(range.getClientRects()).filter(hasRect)
      : [];

  if (clientRects.length > 0) {
    return clientRects;
  }

  const boundingRect =
    typeof range.getBoundingClientRect === 'function'
      ? range.getBoundingClientRect()
      : null;

  return hasRect(boundingRect) ? [boundingRect] : [];
};

export const getUsableRangeRect = (range: globalThis.Range): DOMRect | null =>
  getUsableRangeRects(range)[0] ?? null;

export const getCollapsedTextOffsetRect = (
  document: Document,
  textNode: globalThis.Node,
  offset: number
): {
  distance: (point: { x: number; y: number }) => {
    horizontal: number;
    vertical: number;
  };
  offset: number;
} | null => {
  const textLength = textNode.textContent?.length ?? 0;
  const safeOffset = Math.max(0, Math.min(offset, textLength));
  const range = document.createRange();

  range.setStart(textNode, safeOffset);
  range.collapse(true);

  const rect = getUsableRangeRect(range);

  if (rect) {
    return {
      distance: ({ x, y }) => ({
        horizontal: Math.abs(rect.left - x),
        vertical: getRectVerticalDistance(rect, y),
      }),
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

  const probeRect = getUsableRangeRect(probeRange);

  if (!probeRect) {
    return null;
  }

  return {
    distance: ({ x, y }) => ({
      horizontal: Math.abs(
        safeOffset >= textLength ? probeRect.right - x : probeRect.left - x
      ),
      vertical: getRectVerticalDistance(probeRect, y),
    }),
    offset: safeOffset,
  };
};

const getCollapsedOffsetLineRelation = ({
  offset,
  range,
  rect,
  textNode,
}: {
  offset: number;
  range: globalThis.Range;
  rect: DOMRect;
  textNode: globalThis.Node;
}): 'inside' | 'outside' | 'unavailable' => {
  range.setStart(textNode, offset);
  range.setEnd(textNode, offset);

  const collapsedRects = getUsableRangeRects(range);

  if (collapsedRects.length === 0) {
    return 'unavailable';
  }

  const y = rect.top + rect.height / 2;
  const tolerance = Math.max(2, rect.height / 4);

  return collapsedRects.every(
    (collapsedRect) => getRectVerticalDistance(collapsedRect, y) > tolerance
  )
    ? 'outside'
    : 'inside';
};

const areSegmentRectsOutsideLine = ({
  end,
  range,
  rect,
  start,
  textNode,
}: {
  end: number;
  range: globalThis.Range;
  rect: DOMRect;
  start: number;
  textNode: globalThis.Node;
}) => {
  range.setStart(textNode, start);
  range.setEnd(textNode, end);

  const segmentRects = getUsableRangeRects(range);

  if (segmentRects.length === 0) {
    return false;
  }

  const y = rect.top + rect.height / 2;
  const tolerance = Math.max(2, rect.height / 4);

  return segmentRects.every(
    (segmentRect) => getRectVerticalDistance(segmentRect, y) > tolerance
  );
};

const isNextPliteStringSegmentOutsideLine = ({
  range,
  rect,
  string,
}: {
  range: globalThis.Range;
  rect: DOMRect;
  string: HTMLElement;
}) => {
  const textHost = string.closest<HTMLElement>('[data-editor-node="text"]');
  const scope = textHost?.parentElement ?? textHost;

  if (!scope) {
    return false;
  }

  const strings = Array.from(
    scope.querySelectorAll<HTMLElement>(
      '[data-editor-string], [data-editor-zero-width]'
    )
  );
  const stringIndex = strings.indexOf(string);

  if (stringIndex === -1) {
    return false;
  }

  for (const nextString of strings.slice(stringIndex + 1)) {
    if (nextString.hasAttribute('data-editor-zero-width')) {
      continue;
    }

    const nextTextNode = Array.from(nextString.childNodes).find(
      (node) => node.nodeType === 3
    );
    const nextText = nextTextNode?.textContent ?? '';

    if (!nextTextNode || nextText.length === 0) {
      continue;
    }

    const nextOffsets = getGraphemeBoundaryOffsets(nextText);
    const nextEnd = nextOffsets[1];

    return nextEnd == null
      ? false
      : areSegmentRectsOutsideLine({
          end: nextEnd,
          range,
          rect,
          start: 0,
          textNode: nextTextNode,
        });
  }

  return false;
};

const getSegmentEndOffset = ({
  end,
  index,
  offsets,
  range,
  rect,
  segment,
  segmentRect,
  start,
  string,
  textNode,
}: {
  end: number;
  index: number;
  offsets: number[];
  range: globalThis.Range;
  rect: DOMRect;
  segment: string;
  segmentRect: DOMRect;
  start: number;
  string: HTMLElement;
  textNode: globalThis.Node;
}) => {
  const nextEnd = offsets[index + 2];
  const collapsedRelation = CSS_BREAK_WHITESPACE_PATTERN.test(segment)
    ? getCollapsedOffsetLineRelation({ offset: end, range, rect, textNode })
    : 'inside';

  return CSS_BREAK_WHITESPACE_PATTERN.test(segment) &&
    (collapsedRelation === 'outside' ||
      (nextEnd != null &&
        collapsedRelation === 'unavailable' &&
        segmentRect.width === 0 &&
        areSegmentRectsOutsideLine({
          end: nextEnd,
          range,
          rect,
          start: end,
          textNode,
        })) ||
      (nextEnd == null &&
        collapsedRelation === 'unavailable' &&
        segmentRect.width === 0 &&
        isNextPliteStringSegmentOutsideLine({ range, rect, string })))
    ? start
    : end;
};

export const getPliteStringLineEdgeTextOffset = ({
  edge,
  rect,
  string,
}: {
  edge: 'end' | 'start';
  rect: DOMRect;
  string: HTMLElement;
}) => {
  const textNode = Array.from(string.childNodes).find(
    (node) => node.nodeType === 3
  );

  if (!textNode) {
    return edge === 'start' ? 0 : getPliteStringLength(string);
  }

  const textLength = textNode.textContent?.length ?? 0;

  if (textLength === 0) {
    return 0;
  }

  const physicalEdge = getPhysicalEdgeFromLogicalEdge(string, edge);
  const text = textNode.textContent ?? '';
  const offsets = getGraphemeBoundaryOffsets(text);
  const y = rect.top + rect.height / 2;
  const range = string.ownerDocument.createRange();
  let best: {
    horizontalDistance: number;
    offset: number;
    verticalCenterDistance: number;
    verticalDistance: number;
  } | null = null;

  for (let index = 0; index < offsets.length - 1; index++) {
    const start = offsets[index];
    const end = offsets[index + 1];
    const segment = text.slice(start, end);

    range.setStart(textNode, start);
    range.setEnd(textNode, end);

    for (const characterRect of getUsableRangeRects(range)) {
      const verticalDistance = getRectVerticalDistance(characterRect, y);
      const verticalCenterDistance = getRectVerticalCenterDistance(
        characterRect,
        y
      );
      const horizontalDistance =
        physicalEdge === 'left'
          ? Math.abs(characterRect.left - rect.left)
          : Math.abs(characterRect.right - rect.right);
      const candidate = {
        horizontalDistance,
        offset:
          edge === 'start'
            ? start
            : getSegmentEndOffset({
                end,
                index,
                offsets,
                range,
                rect,
                segment,
                segmentRect: characterRect,
                start,
                string,
                textNode,
              }),
        verticalCenterDistance,
        verticalDistance,
      };

      if (
        !best ||
        candidate.verticalDistance < best.verticalDistance ||
        (candidate.verticalDistance === best.verticalDistance &&
          candidate.horizontalDistance < best.horizontalDistance) ||
        (candidate.verticalDistance === best.verticalDistance &&
          candidate.horizontalDistance === best.horizontalDistance &&
          candidate.verticalCenterDistance < best.verticalCenterDistance)
      ) {
        best = candidate;
      }
    }
  }

  return best?.offset ?? (edge === 'start' ? 0 : textLength);
};

export const getPliteStringLineHitAtX = ({
  event,
  rect,
  string,
}: {
  event: Pick<MouseEvent, 'clientX' | 'clientY'>;
  rect: DOMRect;
  string: HTMLElement;
}): Readonly<{ offset: number; overLetterBefore: boolean }> | null => {
  const textNode = Array.from(string.childNodes).find(
    (node) => node.nodeType === 3
  );

  if (!textNode) {
    return null;
  }

  const text = textNode.textContent ?? '';

  if (text.length === 0) {
    return { offset: 0, overLetterBefore: false };
  }

  const direction = getPliteStringDirection(string);
  const offsets = getGraphemeBoundaryOffsets(text);
  const range = string.ownerDocument.createRange();
  let best: {
    horizontalDistance: number;
    offset: number;
    overLetterBefore: boolean;
    verticalCenterDistance: number;
    verticalDistance: number;
  } | null = null;

  for (let index = 0; index < offsets.length - 1; index++) {
    const start = offsets[index];
    const end = offsets[index + 1];

    range.setStart(textNode, start);
    range.setEnd(textNode, end);

    for (const characterRect of getUsableRangeRects(range)) {
      const midpoint = characterRect.left + characterRect.width / 2;
      const segment = text.slice(start, end);
      const endOffset = getSegmentEndOffset({
        end,
        index,
        offsets,
        range,
        rect,
        segment,
        segmentRect: characterRect,
        start,
        string,
        textNode,
      });
      const offset =
        direction === 'rtl'
          ? event.clientX <= midpoint
            ? endOffset
            : start
          : event.clientX <= midpoint
            ? start
            : endOffset;
      const horizontalDistance =
        event.clientX < characterRect.left
          ? characterRect.left - event.clientX
          : event.clientX > characterRect.right
            ? event.clientX - characterRect.right
            : 0;
      const candidate = {
        horizontalDistance,
        offset,
        overLetterBefore: offset !== start,
        verticalCenterDistance: getRectVerticalCenterDistance(
          characterRect,
          event.clientY
        ),
        verticalDistance: getRectVerticalDistance(characterRect, event.clientY),
      };

      if (
        !best ||
        candidate.verticalDistance < best.verticalDistance ||
        (candidate.verticalDistance === best.verticalDistance &&
          candidate.horizontalDistance < best.horizontalDistance) ||
        (candidate.verticalDistance === best.verticalDistance &&
          candidate.horizontalDistance === best.horizontalDistance &&
          candidate.verticalCenterDistance < best.verticalCenterDistance)
      ) {
        best = candidate;
      }
    }
  }

  return best?.verticalDistance != null &&
    best.verticalDistance <= Math.max(rect.height, 16)
    ? { offset: best.offset, overLetterBefore: best.overLetterBefore }
    : null;
};

export const getPliteStringCoordinatePlacement = ({
  includeInsideString = false,
  event,
  strings,
}: {
  includeInsideString?: boolean;
  event: Pick<MouseEvent, 'clientX' | 'clientY'>;
  strings: HTMLElement[];
}): PliteStringCoordinatePlacement => {
  const nearestString = getPliteStringRectCandidates({
    event,
    strings,
  }).sort((left, right) => {
    if (left.verticalDistance !== right.verticalDistance) {
      return left.verticalDistance - right.verticalDistance;
    }

    const leftHorizontalDistance = getRectHorizontalDistance(
      left.rect,
      event.clientX
    );
    const rightHorizontalDistance = getRectHorizontalDistance(
      right.rect,
      event.clientX
    );

    if (leftHorizontalDistance !== rightHorizontalDistance) {
      return leftHorizontalDistance - rightHorizontalDistance;
    }

    if (left.verticalCenterDistance !== right.verticalCenterDistance) {
      return left.verticalCenterDistance - right.verticalCenterDistance;
    }

    return (
      Math.abs(left.rect.left + left.rect.width / 2 - event.clientX) -
      Math.abs(right.rect.left + right.rect.width / 2 - event.clientX)
    );
  })[0];

  if (
    !nearestString ||
    nearestString.verticalDistance > PLITE_STRING_PRESS_REACH_PX
  ) {
    return null;
  }

  if (event.clientX <= nearestString.rect.left + STRING_EDGE_HIT_SLOP) {
    return {
      edge: getLogicalEdgeFromPhysicalEdge(nearestString.string, 'left'),
      rect: nearestString.rect,
      source: 'string-edge',
      string: nearestString.string,
    };
  }

  if (event.clientX >= nearestString.rect.right - STRING_EDGE_HIT_SLOP) {
    return {
      edge: getLogicalEdgeFromPhysicalEdge(nearestString.string, 'right'),
      rect: nearestString.rect,
      source: 'string-edge',
      string: nearestString.string,
    };
  }

  if (includeInsideString) {
    const offset = getPliteStringLineHitAtX({
      event,
      rect: nearestString.rect,
      string: nearestString.string,
    })?.offset;

    if (offset != null) {
      return {
        edge: 'start',
        offset,
        rect: nearestString.rect,
        source: 'string-offset',
        string: nearestString.string,
      };
    }
  }

  return null;
};

export type PliteStringRectHit = Readonly<{
  horizontal: number;
  rect: DOMRect;
  string: HTMLElement;
  vertical: number;
}>;

const PLITE_TEXT_SELECTOR = '[data-editor-string], [data-editor-zero-width]';

export const isOwnedPliteText = (root: HTMLElement, string: Element) =>
  string.closest('[data-editor="true"]') === root &&
  !string.closest('[data-editor-void="true"]');

export const getOwnedPliteTextStrings = (
  root: HTMLElement,
  scope: Element
): HTMLElement[] =>
  [
    ...(scope.matches(PLITE_TEXT_SELECTOR) ? [scope as HTMLElement] : []),
    ...scope.querySelectorAll<HTMLElement>(PLITE_TEXT_SELECTOR),
  ].filter((string) => isOwnedPliteText(root, string));

const getStringTextNode = (string: HTMLElement) =>
  Array.from(string.childNodes).find((node) => node.nodeType === 3) ?? null;

export const getPliteStringDirectPlacement = ({
  root,
  target,
  x,
  y,
}: {
  root: HTMLElement;
  target: Element | null;
  x: number;
  y: number;
}): PliteStringLetterPlacement | null => {
  const string = target?.closest<HTMLElement>(PLITE_TEXT_SELECTOR);

  if (!string || !isOwnedPliteText(root, string)) return null;
  const rect = Array.from(string.getClientRects()).find(
    (candidate) =>
      x >= candidate.left &&
      x <= candidate.right &&
      y >= candidate.top &&
      y <= candidate.bottom
  );

  if (!rect) return null;
  const point = getNativeDOMPointAtCoordinates(string.ownerDocument, x, y);

  if (!point || point[0] !== getStringTextNode(string)) return null;
  const [, offset] = point;

  return {
    edge: 'start',
    offset,
    overLetterBefore: isOverLetterBefore(string.ownerDocument, point, x, y),
    rect,
    source: 'string-offset',
    string,
  };
};

// A collapsed caret's own rect can sit on either line at a soft wrap, so the
// side comes from the letter before the caret.
const isOverLetterBefore = (
  document: Document,
  [textNode, offset]: DOMGeometryPoint,
  x: number,
  y: number
) => {
  if (offset === 0) return false;
  const boundaries = getGraphemeBoundaryOffsets(textNode.textContent ?? '');
  const start = boundaries.findLast((boundary) => boundary < offset) ?? 0;
  const end = boundaries.find((boundary) => boundary >= offset) ?? offset;
  const letter = document.createRange();

  letter.setStart(textNode, start);
  letter.setEnd(textNode, end);
  return getUsableRangeRects(letter).some(
    (candidate) =>
      x >= candidate.left &&
      x < candidate.right &&
      y >= candidate.top &&
      y <= candidate.bottom
  );
};

export const getNearestPliteStringRect = ({
  strings,
  x,
  y,
}: {
  strings: readonly HTMLElement[];
  x: number;
  y: number;
}): PliteStringRectHit | null => {
  let best: PliteStringRectHit | null = null;

  for (const string of strings) {
    for (const rect of string.getClientRects()) {
      if (!hasUsableDOMRect(rect)) continue;
      const vertical = getRectVerticalDistance(rect, y);
      const horizontal = getRectHorizontalDistance(rect, x);

      if (
        !best ||
        vertical < best.vertical ||
        (vertical === best.vertical && horizontal < best.horizontal)
      ) {
        best = { horizontal, rect, string, vertical };
        if (vertical === 0 && horizontal === 0) return best;
      }
    }
  }

  return best;
};

export const getPliteStringPlacementAtX = ({
  rect,
  string,
  x,
}: {
  rect: DOMRect;
  string: HTMLElement;
  x: number;
}): PliteStringLetterPlacement | null => {
  const hit = getPliteStringLineHitAtX({
    event: { clientX: x, clientY: rect.top + rect.height / 2 },
    rect,
    string,
  });

  return (
    hit && {
      edge: 'start',
      ...hit,
      rect,
      source: 'string-offset',
      string,
    }
  );
};

const getDOMPointElement = (point: DOMGeometryPoint) => {
  const [node] = point;

  return node.nodeType === 1 ? (node as Element) : node.parentElement;
};

const isFiniteRect = (rect: DOMGeometryRect | null): rect is DOMGeometryRect =>
  !!rect &&
  Number.isFinite(rect.left) &&
  Number.isFinite(rect.right) &&
  Number.isFinite(rect.top) &&
  Number.isFinite(rect.bottom);

export const hasUsableDOMRect = (
  rect: DOMGeometryRect | null
): rect is DOMGeometryRect =>
  isFiniteRect(rect) &&
  (rect.width > 0 ||
    rect.height > 0 ||
    rect.left !== 0 ||
    rect.right !== 0 ||
    rect.top !== 0 ||
    rect.bottom !== 0);

const getElementDirection = (element: Element | null) => {
  const computedDirection =
    element?.ownerDocument.defaultView?.getComputedStyle(element).direction;
  const declaredDirection =
    (element as HTMLElement | null)?.style?.direction ??
    element?.getAttribute('dir');

  return computedDirection === 'rtl' ||
    (computedDirection !== 'ltr' && declaredDirection === 'rtl')
    ? 'rtl'
    : 'ltr';
};

const createCollapsedRect = (
  document: Document,
  rect: DOMGeometryRect,
  x: number
): DOMRect => {
  const DOMRectConstructor = document.defaultView?.DOMRect;

  if (DOMRectConstructor) {
    return new DOMRectConstructor(x, rect.top, 0, rect.height);
  }

  return {
    bottom: rect.bottom,
    height: rect.height,
    left: x,
    right: x,
    top: rect.top,
    width: 0,
    x,
    y: rect.top,
    toJSON: () => ({
      bottom: rect.bottom,
      height: rect.height,
      left: x,
      right: x,
      top: rect.top,
      width: 0,
      x,
      y: rect.top,
    }),
  };
};

const getClosestBoundary = (
  boundaries: number[],
  offset: number,
  association: DOMGeometryAssociation
) => {
  if (boundaries.includes(offset)) return offset;

  if (association === 'backward') {
    return boundaries.findLast((boundary) => boundary < offset) ?? 0;
  }

  return (
    boundaries.find((boundary) => boundary > offset) ??
    boundaries.at(-1) ??
    failInvariant('Expected value to be defined')
  );
};

const getAdjacentGrapheme = (
  text: string,
  offset: number,
  association: DOMGeometryAssociation
) => {
  const boundaries = getGraphemeBoundaryOffsets(text);
  const boundary = getClosestBoundary(boundaries, offset, association);
  const boundaryIndex = boundaries.indexOf(boundary);
  const previousStart = boundaries[boundaryIndex - 1];
  const nextEnd = boundaries[boundaryIndex + 1];

  if (association === 'backward' && previousStart != null) {
    return { edge: 'end' as const, end: boundary, start: previousStart };
  }

  if (association === 'forward' && nextEnd != null) {
    return { edge: 'start' as const, end: nextEnd, start: boundary };
  }

  if (previousStart != null) {
    return { edge: 'end' as const, end: boundary, start: previousStart };
  }

  return nextEnd == null
    ? null
    : { edge: 'start' as const, end: nextEnd, start: boundary };
};

const getCaretPositionDOMPointAtCoordinates = (
  document: Document,
  x: number,
  y: number
): DOMGeometryPoint | null => {
  const position = document.caretPositionFromPoint?.(x, y);

  return position ? [position.offsetNode, position.offset] : null;
};

const getCaretRangeDOMPointAtCoordinates = (
  document: Document,
  x: number,
  y: number
): DOMGeometryPoint | null => {
  // oxlint-disable-next-line typescript/no-deprecated -- [P1 local-invariant] WebKit exposes caretRangeFromPoint instead of the standard caretPositionFromPoint API.
  if (typeof document.caretRangeFromPoint === 'function') {
    // oxlint-disable-next-line typescript/no-deprecated -- [P1 local-invariant] Call the WebKit API only after its runtime presence check.
    const range = document.caretRangeFromPoint(x, y);

    return range ? [range.startContainer, range.startOffset] : null;
  }

  return null;
};

const getNativeDOMPointAtCoordinates = (
  document: Document,
  x: number,
  y: number
): DOMGeometryPoint | null => {
  // oxlint-disable-next-line typescript/no-deprecated -- [P1 local-invariant] A present WebKit caret API owns the result, including null, instead of falling through to different hit-testing semantics.
  if (typeof document.caretRangeFromPoint === 'function') {
    return getCaretRangeDOMPointAtCoordinates(document, x, y);
  }

  return getCaretPositionDOMPointAtCoordinates(document, x, y);
};

const isPointInside = (point: DOMGeometryPoint, host: Element) => {
  const [node] = point;

  return node === host || host.contains(node);
};

const getOwnedPliteStrings = ({
  root,
  target,
}: {
  root: HTMLElement;
  target?: Element | null;
}) => {
  const targetTextHost = target?.closest<HTMLElement>(
    '[data-editor-node="text"]'
  );
  const targetElementHost = target?.closest<HTMLElement>(
    '[data-editor-node="element"]'
  );
  const targetHost = targetTextHost ?? targetElementHost;
  const targetOwner = targetHost?.closest<HTMLElement>('[data-editor="true"]');
  const scope = targetHost && targetOwner === root ? targetHost : root;
  const candidates = [
    ...(scope.matches('[data-editor-string], [data-editor-zero-width]')
      ? [scope]
      : []),
    ...Array.from(
      scope.querySelectorAll<HTMLElement>(
        '[data-editor-string], [data-editor-zero-width]'
      )
    ),
  ];

  return candidates.filter((string) => {
    const owner = string.closest<HTMLElement>('[data-editor="true"]');

    return root.contains(string) && (!owner || owner === root);
  });
};

export const caretShowsPointOffTextFlowCharacters = ({
  host,
  x,
  y,
}: {
  host: HTMLElement;
  x: number;
  y: number;
}) => {
  const point = getNativeDOMPointAtCoordinates(host.ownerDocument, x, y);

  if (!point) return false;

  const [node, offset] = point;

  if (!isPointInside(point, host) || !isDOMText(node)) return true;

  // A caret at a text node edge can belong to either node, and it can sit past
  // or inside a cluster or pair, so the check reads every box near the caret
  // instead of one code point.
  const range = host.ownerDocument.createRange();

  range.setStart(...moveTextPoint(host, node, offset, -TEXT_FLOW_CARET_REACH));
  range.setEnd(...moveTextPoint(host, node, offset, TEXT_FLOW_CARET_REACH));

  return !getUsableRangeRects(range).some(
    (rect) =>
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  );
};

const TEXT_FLOW_CARET_REACH = 16;

const moveTextPoint = (
  host: HTMLElement,
  node: Text,
  offset: number,
  units: number
): [Text, number] => {
  const walker = host.ownerDocument.createTreeWalker(
    host,
    host.ownerDocument.defaultView?.NodeFilter.SHOW_TEXT ?? 4
  );
  let current = node;
  let at = offset + units;

  walker.currentNode = node;
  while (at < 0 || at > current.data.length) {
    const next = (
      at < 0 ? walker.previousNode() : walker.nextNode()
    ) as Text | null;

    if (!next) return [current, at < 0 ? 0 : current.data.length];
    at = at < 0 ? at + next.data.length : at - current.data.length;
    current = next;
  }

  return [current, at];
};

const getRootEdgeCoordinatePlacement = ({
  root,
  strings,
  x,
  y,
}: {
  root: HTMLElement;
  strings: HTMLElement[];
  x: number;
  y: number;
}): PliteStringCoordinatePlacement => {
  const rootRect = root.getBoundingClientRect();

  if (y < rootRect.top || y > rootRect.bottom) return null;

  const candidates = getPliteStringRectCandidates({
    event: { clientY: y },
    strings,
  });
  const nearest = candidates.sort((left, right) => {
    if (left.verticalDistance !== right.verticalDistance) {
      return left.verticalDistance - right.verticalDistance;
    }

    const horizontal =
      getRectHorizontalDistance(left.rect, x) -
      getRectHorizontalDistance(right.rect, x);

    if (horizontal !== 0) return horizontal;
    if (left.verticalCenterDistance !== right.verticalCenterDistance) {
      return left.verticalCenterDistance - right.verticalCenterDistance;
    }

    return (
      Math.abs(left.rect.left + left.rect.width / 2 - x) -
      Math.abs(right.rect.left + right.rect.width / 2 - x)
    );
  })[0];

  if (!nearest) return null;

  const firstTop = Math.min(...candidates.map(({ rect }) => rect.top));
  const lastBottom = Math.max(...candidates.map(({ rect }) => rect.bottom));
  const horizontalDistance = getRectHorizontalDistance(nearest.rect, x);

  if (y < nearest.rect.top && (y < firstTop || horizontalDistance === 0)) {
    return {
      edge: 'start',
      rect: nearest.rect,
      source: 'root-edge',
      string: nearest.string,
    };
  }

  if (y > nearest.rect.bottom && (y > lastBottom || horizontalDistance === 0)) {
    return {
      edge: 'end',
      rect: nearest.rect,
      source: 'root-edge',
      string: nearest.string,
    };
  }

  return null;
};

const getTopLevelElement = (root: HTMLElement, string: HTMLElement) => {
  const element = string.closest<HTMLElement>(
    '[data-editor-node="element"][data-editor-path]:not([data-editor-path*=","])'
  );
  const owner = element?.closest<HTMLElement>('[data-editor="true"]');

  return element && owner === root ? element : null;
};

const getBlockEdgeCoordinatePlacement = ({
  root,
  strings,
  x,
  y,
}: {
  root: HTMLElement;
  strings: HTMLElement[];
  x: number;
  y: number;
}): PliteStringCoordinatePlacement => {
  const candidates = Array.from(
    new Set(strings.map((string) => getTopLevelElement(root, string)))
  )
    .filter((element): element is HTMLElement => element !== null)
    .flatMap((element, order) => {
      const rect = element.getBoundingClientRect();
      const verticalDistance = getRectVerticalDistance(rect, y);

      if (
        verticalDistance === 0 ||
        verticalDistance > BLOCK_EDGE_HIT_SLOP ||
        x < rect.left ||
        x > rect.right
      ) {
        return [];
      }

      return [{ element, order, rect, verticalDistance }];
    })
    .sort(
      (left, right) =>
        left.verticalDistance - right.verticalDistance ||
        left.order - right.order
    );
  const nearest = candidates[0];

  if (!nearest) return null;

  const blockStrings = strings.filter(
    (string) => getTopLevelElement(root, string) === nearest.element
  );
  const edge = y < nearest.rect.top ? 'start' : 'end';
  const string = edge === 'start' ? blockStrings[0] : blockStrings.at(-1);
  const rects = string
    ? Array.from(string.getClientRects()).filter(hasUsableDOMRect)
    : [];
  const rect = edge === 'start' ? rects[0] : rects.at(-1);

  return string && rect ? { edge, rect, source: 'string-edge', string } : null;
};

const getStringPlacementDOMPoint = (
  placement: NonNullable<PliteStringCoordinatePlacement>
): DOMGeometryPoint | null => {
  const textNode = Array.from(placement.string.childNodes).find(
    (node) => node.nodeType === 3
  );

  if (!textNode) return null;

  const textLength = textNode.textContent?.length ?? 0;
  const offset =
    placement.offset ??
    getPliteStringLineEdgeTextOffset({
      edge: placement.edge,
      rect: placement.rect,
      string: placement.string,
    });

  return [textNode, Math.max(0, Math.min(offset, textLength))];
};

export const getPliteStringDocumentOffset = ({
  offset: stringOffset,
  string,
  textHost,
}: {
  offset: number;
  string: HTMLElement;
  textHost: HTMLElement;
}) => {
  const textFlowOffset = resolveDOMTextFlowStringOffset(
    textHost,
    string,
    stringOffset
  );

  if (textFlowOffset != null) return textFlowOffset;
  const leaf = string.closest<HTMLElement>('[data-editor-leaf]');
  const leafStartAttribute = leaf?.getAttribute('data-editor-leaf-start');
  const leafEndAttribute = leaf?.getAttribute('data-editor-leaf-end');

  if (leafStartAttribute != null && leafEndAttribute != null) {
    const leafStart = Number(leafStartAttribute);
    const leafEnd = Number(leafEndAttribute);

    if (!Number.isFinite(leafStart) || !Number.isFinite(leafEnd)) return null;

    return Math.max(leafStart, Math.min(leafStart + stringOffset, leafEnd));
  }

  let offset = 0;

  for (const candidate of getPliteTextHostStrings(textHost)) {
    const length = getPliteStringLength(candidate);

    if (candidate === string) return offset + stringOffset;

    offset += length;
  }

  return null;
};

export const getPliteStringEdgeOffset = ({
  edge,
  rect,
  string,
  textHost,
}: {
  edge: 'end' | 'start';
  rect: DOMRect;
  string: HTMLElement;
  textHost: HTMLElement;
}) =>
  getPliteStringDocumentOffset({
    offset: getPliteStringLineEdgeTextOffset({ edge, rect, string }),
    string,
    textHost,
  });

export const getPliteStringPlacementDOMPoint = getStringPlacementDOMPoint;

const getRectOverlap = (left: DOMGeometryRect, right: DOMGeometryRect) =>
  Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top);

const groupVisualLineRects = (rects: DOMGeometryRect[]): DOMGeometryRect[] => {
  const lines: DOMGeometryRect[] = [];

  for (const rect of rects.sort(
    (left, right) => left.top - right.top || left.left - right.left
  )) {
    const line = lines.find(
      (candidate) => getRectOverlap(rect, candidate) > VISUAL_LINE_TOLERANCE
    );

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

const getElementTextNodes = (element: Element) => {
  const document = element.ownerDocument;
  const showText = document.defaultView?.NodeFilter.SHOW_TEXT ?? 4;
  const walker = document.createTreeWalker(element, showText);
  const nodes: Text[] = [];

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    nodes.push(node as Text);
  }

  return nodes;
};

const TEXT_FLOW_LINE_BREAKS = /\r\n|[\n\r]/g;
const TEXT_FLOW_UNPAINTED = /^(?:\r\n|[\n\r\uFEFF])$/;
const GRAPHEME_CHUNK_LENGTH = 32;

const codePointLengthAt = (data: string, offset: number) =>
  (data.codePointAt(offset) ?? 0) > 0xff_ff ? 2 : 1;

const isTextFlowBreak = (unit: string) =>
  unit === '\n' || unit === '\r' || unit === '\r\n';

export const isOnVisualRow = (rect: DOMGeometryRect, row: DOMGeometryRect) =>
  getRectOverlap(rect, row) > Math.min(rect.height, row.height) / 2;

function* getGraphemeRangesFrom(
  data: string,
  from: number
): Generator<readonly [number, number]> {
  let start = from;
  let length = GRAPHEME_CHUNK_LENGTH;

  while (start < data.length) {
    let chunkEnd = Math.min(start + length, data.length);

    if (chunkEnd < data.length && /[\uD800-\uDBFF]/.test(data[chunkEnd - 1])) {
      chunkEnd += 1;
    }

    const chunk = data.slice(start, chunkEnd);
    let next = chunkEnd;

    if (graphemeSegmenter) {
      for (const { index, segment } of graphemeSegmenter.segment(chunk)) {
        const end = start + index + segment.length;

        if (end === chunkEnd && chunkEnd < data.length) {
          next = start + index;
          break;
        }
        yield [start + index, end];
      }
    } else {
      let offset = start;

      for (const character of chunk) {
        yield [offset, offset + character.length];
        offset += character.length;
      }
    }
    if (next === start) length *= 2;
    start = next;
  }
}

// The browser's caret for a point beside a line can land on another line.
export const getTextFlowPointAtCoordinates = ({
  host,
  x,
  y,
}: {
  host: HTMLElement;
  x: number;
  y: number;
}): DOMGeometryPoint | null => {
  const nodes = getElementTextNodes(host).filter((node) => node.data !== '');
  const starts: number[] = [];
  let text = '';

  for (const node of nodes) {
    starts.push(text.length);
    text += node.data;
  }

  if (nodes.length === 0) return null;

  const range = host.ownerDocument.createRange();
  const nodeIndexAt = (index: number) => {
    let low = 0;
    let high = nodes.length - 1;

    while (low < high) {
      const middle = Math.ceil((low + high) / 2);

      if (starts[middle] <= index) low = middle;
      else high = middle - 1;
    }

    return low;
  };
  const pointAt = (index: number, from = index): DOMGeometryPoint => {
    const nodeIndex = nodeIndexAt(from);

    return [nodes[nodeIndex], index - starts[nodeIndex]];
  };
  const probes = new Map<number, DOMRect | null>();
  const unitRectAt = (index: number) => {
    if (!probes.has(index)) {
      const end = index + codePointLengthAt(text, index);

      range.setStart(...pointAt(index));
      range.setEnd(...pointAt(end, end - 1));
      probes.set(index, getUsableRangeRects(range)[0] ?? null);
    }

    return probes.get(index) ?? null;
  };
  const paintedUnitAt = (from: number, step: -1 | 1) => {
    for (let index = from; index >= 0 && index < text.length; index += step) {
      if (TEXT_FLOW_UNPAINTED.test(text[index])) continue;

      const rect = unitRectAt(index);

      if (rect) return { index, rect };
    }

    return null;
  };
  const probesInSourceOrder = () => {
    let maxTop = Number.NEGATIVE_INFINITY;

    for (const [, rect] of [...probes].sort(([a], [b]) => a - b)) {
      if (!rect) continue;
      if (rect.bottom < maxTop) return false;
      maxTop = Math.max(maxTop, rect.top);
    }

    return true;
  };

  const firstIndexEndingBelowY = () => {
    let low = 0;
    let high = text.length;

    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      const unit = paintedUnitAt(middle, 1);

      if (!unit || unit.rect.bottom > y) high = middle;
      else low = middle + 1;
    }

    return low;
  };

  const split = firstIndexEndingBelowY();
  const below = paintedUnitAt(split, 1);
  const above = split > 0 ? paintedUnitAt(split - 1, -1) : null;
  const nearest =
    below &&
    (!above ||
      getRectVerticalDistance(below.rect, y) <=
        getRectVerticalDistance(above.rect, y))
      ? below
      : above;

  if (!nearest) {
    const rowStarts = [...text.matchAll(TEXT_FLOW_LINE_BREAKS)].map(
      (match) => match.index + match[0].length
    );

    let low = 0;
    let high = rowStarts.length;

    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      const rect = unitRectAt(rowStarts[middle] - 1);

      if (!rect) return null;
      if (rect.bottom <= y) low = middle + 1;
      else high = middle;
    }

    return (rowStarts.length > 0 || unitRectAt(0)) && probesInSourceOrder()
      ? pointAt(low === 0 ? 0 : rowStarts[low - 1])
      : null;
  }

  if (!below || below.rect.top > y) {
    const from = above ? above.index + 1 : 0;
    const breaks = [
      ...text
        .slice(from, below?.index ?? text.length)
        .matchAll(TEXT_FLOW_LINE_BREAKS),
    ];
    const breaksEndingAbove = above ? 1 : 0;
    const emptyRows = breaks.length - breaksEndingAbove;

    if (emptyRows > 0) {
      const height =
        above && below
          ? (below.rect.top - above.rect.bottom) / emptyRows
          : nearest.rect.height;
      const top = above
        ? above.rect.bottom
        : nearest.rect.top - emptyRows * height;
      const row = Math.max(
        0,
        Math.min(emptyRows - 1, Math.floor((y - top) / height))
      );
      const previousBreak = above ? breaks[row] : breaks[row - 1];

      return pointAt(
        previousBreak
          ? from + previousBreak.index + previousBreak[0].length
          : from
      );
    }
  }

  const row = nearest.rect;

  let low = 0;
  let high = nearest.index;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const unit = paintedUnitAt(middle, 1);

    if (
      unit &&
      unit.index < nearest.index &&
      unit.rect.top < row.top &&
      !isOnVisualRow(unit.rect, row)
    ) {
      low = unit.index + 1;
    } else {
      high = middle;
    }
  }

  if (!probesInSourceOrder()) return null;

  const rowStart = paintedUnitAt(low, 1)?.index ?? nearest.index;
  let best: { distance: number; point: DOMGeometryPoint } | null = null;
  let hit: DOMGeometryPoint | null = null;
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let last: {
    rect: DOMRect;
    space: boolean;
    start: DOMGeometryPoint;
  } | null = null;
  let end: DOMGeometryPoint = pointAt(rowStart);
  let reachedNearest = false;
  let wrapped = false;

  for (const [start, stop] of getGraphemeRangesFrom(text, rowStart)) {
    const unit = text.slice(start, stop);

    if (isTextFlowBreak(unit)) break;
    if (unit === '\uFEFF') continue;

    const from = pointAt(start);
    const to = pointAt(stop, stop - 1);

    const direction = getElementDirection(from[0].parentElement);

    range.setStart(...from);
    range.setEnd(...to);

    const rects = getUsableRangeRects(range);

    if (rects.length === 0) continue;

    const rect = rects.find((candidate) => isOnVisualRow(candidate, row));
    const startsNextRow =
      rect &&
      last &&
      (rect.top >= last.rect.bottom ||
        (rect.top > last.rect.top + last.rect.height / 2 &&
          (direction === 'rtl' ? rect.right >= right : rect.left <= left)));

    if (!rect || startsNextRow) {
      wrapped = true;
      break;
    }

    reachedNearest ||= stop > nearest.index;
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
    last = {
      rect,
      space: unit.length === 1 && CSS_BREAK_WHITESPACE_PATTERN.test(unit),
      start: from,
    };
    end = to;

    if (!hit && x >= rect.left && x <= rect.right) {
      const midpoint = rect.left + rect.width / 2;
      const beforeMidpoint = direction === 'rtl' ? x > midpoint : x <= midpoint;

      hit = beforeMidpoint ? from : to;
    }

    for (const [point, edgeX] of [
      [from, direction === 'rtl' ? rect.right : rect.left],
      [to, direction === 'rtl' ? rect.left : rect.right],
    ] as const) {
      const distance = Math.abs(edgeX - x);

      if (!best || distance < best.distance) best = { distance, point };
    }
  }

  if (!reachedNearest) return null;
  if (hit) return hit;

  const logicalStart = pointAt(rowStart);
  const logicalEnd = wrapped && last?.space ? last.start : end;
  const rtl = getElementDirection(host) === 'rtl';

  if (x > right) return rtl ? logicalStart : logicalEnd;
  if (x < left) return rtl ? logicalEnd : logicalStart;

  return best?.point ?? null;
};

const getTextOffsetInVisualLineByX = ({
  line,
  textNode,
  x,
}: {
  line: DOMGeometryRect;
  textNode: Text;
  x: number;
}): number | null => {
  const text = textNode.textContent ?? '';
  const offsets = getGraphemeBoundaryOffsets(text);
  const range = textNode.ownerDocument.createRange();
  const direction = getElementDirection(textNode.parentElement);
  let best: { distance: number; offset: number } | null = null;

  for (let index = 0; index < offsets.length - 1; index++) {
    const start = offsets[index];
    const end = offsets[index + 1];

    range.setStart(textNode, start);
    range.setEnd(textNode, end);

    for (const rect of getUsableRangeRects(range)) {
      if (getRectOverlap(rect, line) <= VISUAL_LINE_TOLERANCE) continue;

      const midpoint = rect.left + rect.width / 2;
      const startX = direction === 'rtl' ? rect.right : rect.left;
      const endX = direction === 'rtl' ? rect.left : rect.right;

      if (x >= rect.left && x <= rect.right) {
        return direction === 'rtl'
          ? x > midpoint
            ? start
            : end
          : x <= midpoint
            ? start
            : end;
      }

      for (const candidate of [
        { offset: start, x: startX },
        { offset: end, x: endX },
      ]) {
        const distance = Math.abs(candidate.x - x);

        if (!best || distance < best.distance) {
          best = { distance, offset: candidate.offset };
        }
      }
    }
  }

  return best?.offset ?? null;
};

const copyTextMeasurementStyles = (from: HTMLElement, to: HTMLElement) => {
  const style = from.ownerDocument.defaultView?.getComputedStyle(from);

  if (!style) return;

  to.style.boxSizing = 'border-box';
  to.style.direction = style.direction;
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

export const createDOMGeometryKernel = ({
  root,
  target = null,
}: {
  root: HTMLElement;
  target?: Element | null;
}) => {
  const ownsPoint = (point: DOMGeometryPoint, scope = target) => {
    if (!isPointInside(point, root)) return false;

    const element = getDOMPointElement(point);
    const owner = element?.closest<HTMLElement>('[data-editor="true"]');
    const textHost = scope?.closest<HTMLElement>('[data-editor-node="text"]');

    return (
      (!owner || owner === root) &&
      (!textHost || isPointInside(point, textHost))
    );
  };

  const ownsRange = (range: globalThis.Range) =>
    ownsPoint([range.startContainer, range.startOffset], null) &&
    ownsPoint([range.endContainer, range.endOffset], null);

  const pointRect = (
    point: DOMGeometryPoint,
    {
      association = 'backward',
      mode = 'caret',
    }: {
      association?: DOMGeometryAssociation;
      mode?: 'caret' | 'probe';
    } = {}
  ): DOMRect | null => {
    if (!ownsPoint(point, null)) return null;

    const [node, offset] = point;
    const document = node.ownerDocument;

    if (!document) return null;

    if (node.nodeType !== 3) {
      const element = node as Element;
      const childIndex =
        association === 'backward'
          ? Math.max(0, offset - 1)
          : Math.min(offset, element.childNodes.length - 1);
      const child = element.childNodes[childIndex];
      const childElement =
        child?.nodeType === 1
          ? (child as Element)
          : (child?.parentElement ?? element);
      const rect = childElement.getBoundingClientRect();

      if (!hasUsableDOMRect(rect) || mode === 'probe') return rect;

      const x = association === 'backward' ? rect.right : rect.left;

      return createCollapsedRect(document, rect, x);
    }

    const textNode = node as Text;
    const text = textNode.textContent ?? '';
    const safeOffset = Math.max(0, Math.min(offset, text.length));
    const collapsed = document.createRange();

    collapsed.setStart(textNode, safeOffset);
    collapsed.collapse(true);

    const collapsedRect = getUsableRangeRect(collapsed);

    if (collapsedRect) {
      if (mode === 'probe' || collapsedRect.width === 0) return collapsedRect;

      return createCollapsedRect(document, collapsedRect, collapsedRect.left);
    }

    const segment = getAdjacentGrapheme(text, safeOffset, association);

    if (!segment) return null;

    const range = document.createRange();

    range.setStart(textNode, segment.start);
    range.setEnd(textNode, segment.end);

    const rects = getUsableRangeRects(range);
    const rect =
      association === 'backward' ? (rects.at(-1) ?? null) : (rects[0] ?? null);

    if (!rect || mode === 'probe') return rect;

    const direction = getElementDirection(textNode.parentElement);
    const x =
      segment.edge === 'start'
        ? direction === 'rtl'
          ? rect.right
          : rect.left
        : direction === 'rtl'
          ? rect.left
          : rect.right;

    return createCollapsedRect(document, rect, x);
  };

  const coordinatePlacement = ({
    includeInsideString = false,
    x,
    y,
  }: {
    includeInsideString?: boolean;
    x: number;
    y: number;
  }): PliteStringCoordinatePlacement => {
    const strings = getOwnedPliteStrings({ root, target });

    return (
      getPliteStringCoordinatePlacement({
        event: { clientX: x, clientY: y },
        includeInsideString,
        strings,
      }) ??
      getBlockEdgeCoordinatePlacement({ root, strings, x, y }) ??
      getRootEdgeCoordinatePlacement({ root, strings, x, y })
    );
  };

  const associationForPoint = (
    point: DOMGeometryPoint,
    x: number
  ): DOMGeometryAssociation => {
    const backward = pointRect(point, { association: 'backward' });
    const forward = pointRect(point, { association: 'forward' });

    if (!backward) return 'forward';
    if (!forward) return 'backward';

    return Math.abs(backward.left - x) <= Math.abs(forward.left - x)
      ? 'backward'
      : 'forward';
  };

  const pointAtCoordinates = ({
    useFallback = true,
    useNative = true,
    x,
    y,
  }: {
    useFallback?: boolean;
    useNative?: boolean;
    x: number;
    y: number;
  }): {
    association: DOMGeometryAssociation;
    point: DOMGeometryPoint;
  } | null => {
    if (useNative) {
      const nativePoint = getNativeDOMPointAtCoordinates(
        root.ownerDocument,
        x,
        y
      );

      if (nativePoint && ownsPoint(nativePoint)) {
        return {
          association: associationForPoint(nativePoint, x),
          point: nativePoint,
        };
      }
    }

    if (!useFallback) return null;

    const placement = coordinatePlacement({
      includeInsideString: true,
      x,
      y,
    });
    const placementPoint = placement
      ? getStringPlacementDOMPoint(placement)
      : null;

    if (placement && placementPoint && ownsPoint(placementPoint)) {
      return {
        association:
          placement.offset == null
            ? placement.edge === 'start'
              ? 'forward'
              : 'backward'
            : associationForPoint(placementPoint, x),
        point: placementPoint,
      };
    }

    const strings = getOwnedPliteStrings({ root, target });
    let best:
      | {
          distance: { horizontal: number; vertical: number };
          point: DOMGeometryPoint;
        }
      | undefined;

    for (const string of strings) {
      const textNode = Array.from(string.childNodes).find(
        (node) => node.nodeType === 3
      );

      if (!textNode) continue;

      const text = textNode.textContent ?? '';

      for (const offset of getGraphemeBoundaryOffsets(text)) {
        const candidate = getCollapsedTextOffsetRect(
          root.ownerDocument,
          textNode,
          offset
        );

        if (!candidate) continue;

        const distance = candidate.distance({ x, y });

        if (
          !best ||
          distance.vertical < best.distance.vertical ||
          (distance.vertical === best.distance.vertical &&
            distance.horizontal < best.distance.horizontal)
        ) {
          best = { distance, point: [textNode, candidate.offset] };
        }
      }
    }

    return best
      ? {
          association: associationForPoint(best.point, x),
          point: best.point,
        }
      : null;
  };

  const rangeRect = (
    range: globalThis.Range | null,
    {
      association = 'backward',
      fallbackPoint,
    }: {
      association?: DOMGeometryAssociation;
      fallbackPoint?: DOMGeometryPoint | null;
    } = {}
  ): DOMRect | null => {
    if (range && ownsRange(range)) {
      const rect = getUsableRangeRect(range);

      if (rect) return rect;
    }

    const point =
      fallbackPoint ??
      (range?.collapsed
        ? ([range.startContainer, range.startOffset] as const)
        : null);

    return point ? pointRect(point, { association }) : null;
  };

  const visualLines = (
    source: Element | globalThis.Range = target ?? root
  ): DOMGeometryRect[] => {
    if ('startContainer' in source) {
      return ownsRange(source)
        ? groupVisualLineRects(getUsableRangeRects(source))
        : [];
    }

    if (source !== root && !root.contains(source)) return [];

    const strings = getOwnedPliteStrings({ root, target: source }).filter(
      (string) =>
        source === root || source === string || source.contains(string)
    );
    const rects = strings.flatMap((string) => {
      const clientRects = Array.from(string.getClientRects()).filter(
        hasUsableDOMRect
      );

      if (clientRects.length > 0) return clientRects;

      const bounding = string.getBoundingClientRect();

      return hasUsableDOMRect(bounding) ? [bounding] : [];
    });

    return groupVisualLineRects(rects);
  };

  const visualLineHost = (point: DOMGeometryPoint): HTMLElement | null => {
    if (!ownsPoint(point, null)) return null;

    const element = getDOMPointElement(point);
    const textHost =
      element?.closest<HTMLElement>('[data-editor-node="text"]') ?? null;

    return (
      textHost?.closest<HTMLElement>(
        '[data-editor-node="element"][data-editor-path]'
      ) ?? textHost
    );
  };

  const verticalNavigationX = (point: DOMGeometryPoint): number | null => {
    const host = visualLineHost(point);
    const boundary = pointRect(point);

    if (!host || !boundary) return null;

    const container = host.getBoundingClientRect();

    if (!Number.isFinite(container.left) || !Number.isFinite(boundary.left)) {
      return null;
    }

    // Bar-caret navigation uses the rounded leading edge of the painted caret;
    // a collapsed DOM Range exposes the unrounded insertion boundary instead.
    return getVerticalNavigationCaretX({
      boundaryX: boundary.left,
      containerX: container.left,
    });
  };

  const pointInVisualLine = ({
    host,
    line,
    x,
  }: {
    host: HTMLElement;
    line: DOMGeometryRect;
    x: number;
  }): DOMGeometryPoint | null => {
    if (!root.contains(host)) return null;

    const y = line.top + line.height / 2;
    const native = pointAtCoordinates({ useFallback: false, x, y });

    if (native && isPointInside(native.point, host)) {
      const probe = pointRect(native.point, {
        association: native.association,
        mode: 'probe',
      });

      if (!probe || getRectOverlap(probe, line) > VISUAL_LINE_TOLERANCE) {
        return native.point;
      }
    }

    let best: { distance: number; point: DOMGeometryPoint } | null = null;

    for (const textNode of getElementTextNodes(host)) {
      const offset = getTextOffsetInVisualLineByX({ line, textNode, x });

      if (offset == null) continue;

      const candidate: DOMGeometryPoint = [textNode, offset];
      const rect = pointRect(candidate, { mode: 'probe' });

      if (!rect) continue;

      const distance = getRectHorizontalDistance(rect, x);

      if (!best || distance < best.distance) {
        best = { distance, point: candidate };
      }
    }

    return best?.point ?? null;
  };

  const pointAtVisualLineEdge = ({
    edge,
    host,
    line,
  }: {
    edge: 'end' | 'start';
    host: HTMLElement;
    line: DOMGeometryRect;
  }) => {
    const direction = getElementDirection(host);
    const useLeft =
      edge === 'start' ? direction !== 'rtl' : direction === 'rtl';

    return pointInVisualLine({
      host,
      line,
      x: useLeft ? line.left - 1 : line.right + 1,
    });
  };

  const measureTextVisualLineOffset = ({
    edge,
    sourceHost,
    text,
    x,
  }: {
    edge: 'end' | 'start';
    sourceHost: HTMLElement;
    text: string;
    x: number;
  }) => {
    const document = sourceHost.ownerDocument;
    const probe = document.createElement(sourceHost.tagName.toLowerCase());
    const textNode = document.createTextNode(text);
    const sourceRect = sourceHost.getBoundingClientRect();

    copyTextMeasurementStyles(sourceHost, probe);
    probe.style.color = 'transparent';
    probe.style.contain = 'layout style paint';
    probe.style.left = `${sourceRect.left}px`;
    probe.style.pointerEvents = 'none';
    probe.style.position = 'fixed';
    probe.style.top = '0';
    probe.style.width = `${sourceRect.width}px`;
    probe.append(textNode);
    document.body.append(probe);

    try {
      const range = document.createRange();

      range.selectNodeContents(probe);

      const lines = groupVisualLineRects(getUsableRangeRects(range));
      const line = edge === 'start' ? lines[0] : lines.at(-1);

      if (!line) return null;

      return getTextOffsetInVisualLineByX({
        line,
        textNode,
        x,
      });
    } finally {
      probe.remove();
    }
  };

  return {
    associationForPoint,
    coordinatePlacement,
    measureTextVisualLineOffset,
    pointAtCoordinates,
    pointAtVisualLineEdge,
    pointInVisualLine,
    pointRect,
    rangeRect,
    verticalNavigationX,
    visualLineHost,
    visualLines,
  };
};
