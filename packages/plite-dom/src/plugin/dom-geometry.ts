const CSS_BREAK_WHITESPACE_PATTERN = /^[\t\n\f\r ]+$/;
const STRING_EDGE_HIT_SLOP = 3;
const VISUAL_LINE_TOLERANCE = 2;

export type DOMGeometryAssociation = 'backward' | 'forward';

export type DOMGeometryPoint = readonly [globalThis.Node, number];

export type DOMGeometryRect = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

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
  const textHost = string.closest<HTMLElement>('[data-plite-node="text"]');
  const element =
    textHost?.closest<HTMLElement>('[data-plite-node="element"]') ??
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
  const lengthAttribute = string.getAttribute('data-plite-length');
  const length =
    lengthAttribute === null ? null : Number.parseInt(lengthAttribute, 10);

  if (length !== null && Number.isFinite(length)) {
    return length;
  }

  if (string.hasAttribute('data-plite-zero-width')) {
    return 0;
  }

  return string.textContent?.length ?? 0;
};

const getGraphemeBoundaryOffsets = (text: string) => {
  const segmenter =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
      : null;

  if (segmenter) {
    return [
      0,
      ...Array.from(
        segmenter.segment(text),
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

export const getUsableRangeRects = (
  range: globalThis.Range | Range
): DOMRect[] => {
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

export const getUsableRangeRect = (
  range: globalThis.Range | Range
): DOMRect | null => getUsableRangeRects(range)[0] ?? null;

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
  range: globalThis.Range | Range;
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
  range: globalThis.Range | Range;
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
  range: globalThis.Range | Range;
  rect: DOMRect;
  string: HTMLElement;
}) => {
  const textHost = string.closest<HTMLElement>('[data-plite-node="text"]');
  const scope = textHost?.parentElement ?? textHost;

  if (!scope) {
    return false;
  }

  const strings = Array.from(
    scope.querySelectorAll<HTMLElement>(
      '[data-plite-string], [data-plite-zero-width]'
    )
  );
  const stringIndex = strings.indexOf(string);

  if (stringIndex === -1) {
    return false;
  }

  for (const nextString of strings.slice(stringIndex + 1)) {
    if (nextString.hasAttribute('data-plite-zero-width')) {
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
  range: globalThis.Range | Range;
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
    const start = offsets[index]!;
    const end = offsets[index + 1]!;
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

export const getPliteStringLineOffsetAtX = ({
  event,
  rect,
  string,
}: {
  event: Pick<MouseEvent, 'clientX' | 'clientY'>;
  rect: DOMRect;
  string: HTMLElement;
}) => {
  const textNode = Array.from(string.childNodes).find(
    (node) => node.nodeType === 3
  );

  if (!textNode) {
    return null;
  }

  const text = textNode.textContent ?? '';

  if (text.length === 0) {
    return 0;
  }

  const direction = getPliteStringDirection(string);
  const offsets = getGraphemeBoundaryOffsets(text);
  const range = string.ownerDocument.createRange();
  let best: {
    horizontalDistance: number;
    offset: number;
    verticalCenterDistance: number;
    verticalDistance: number;
  } | null = null;

  for (let index = 0; index < offsets.length - 1; index++) {
    const start = offsets[index]!;
    const end = offsets[index + 1]!;

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
    ? best.offset
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

  if (!nearestString || nearestString.verticalDistance > 16) {
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
    const offset = getPliteStringLineOffsetAtX({
      event,
      rect: nearestString.rect,
      string: nearestString.string,
    });

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
    return new DOMRectConstructor(x, rect.top, 0, rect.height) as DOMRect;
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
  } as DOMRect;
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

  return boundaries.find((boundary) => boundary > offset) ?? boundaries.at(-1)!;
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

const getNativeDOMPointAtCoordinates = (
  document: Document,
  x: number,
  y: number
): DOMGeometryPoint | null => {
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(x, y);

    return range ? [range.startContainer, range.startOffset] : null;
  }

  const position = document.caretPositionFromPoint?.(x, y);

  return position ? [position.offsetNode, position.offset] : null;
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
    '[data-plite-node="text"]'
  );
  const targetOwner = targetTextHost?.closest<HTMLElement>(
    '[data-plite-editor="true"]'
  );
  const scope = targetTextHost && targetOwner === root ? targetTextHost : root;
  const candidates = [
    ...(scope.matches('[data-plite-string], [data-plite-zero-width]')
      ? [scope]
      : []),
    ...Array.from(
      scope.querySelectorAll<HTMLElement>(
        '[data-plite-string], [data-plite-zero-width]'
      )
    ),
  ];

  return candidates.filter((string) => {
    const owner = string.closest<HTMLElement>('[data-plite-editor="true"]');

    return root.contains(string) && (!owner || owner === root);
  });
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
  const leaf = string.closest<HTMLElement>('[data-plite-leaf]');
  const leafStartAttribute = leaf?.getAttribute('data-plite-leaf-start');
  const leafEndAttribute = leaf?.getAttribute('data-plite-leaf-end');

  if (leafStartAttribute != null && leafEndAttribute != null) {
    const leafStart = Number(leafStartAttribute);
    const leafEnd = Number(leafEndAttribute);

    if (!Number.isFinite(leafStart) || !Number.isFinite(leafEnd)) return null;

    return Math.max(leafStart, Math.min(leafStart + stringOffset, leafEnd));
  }

  let offset = 0;

  for (const candidate of Array.from(
    textHost.querySelectorAll<HTMLElement>(
      '[data-plite-string], [data-plite-zero-width]'
    )
  )) {
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
  const hitX = Math.floor(x);
  let best: { distance: number; offset: number } | null = null;

  for (let index = 0; index < offsets.length - 1; index++) {
    const start = offsets[index]!;
    const end = offsets[index + 1]!;

    range.setStart(textNode, start);
    range.setEnd(textNode, end);

    for (const rect of getUsableRangeRects(range)) {
      if (getRectOverlap(rect, line) <= VISUAL_LINE_TOLERANCE) continue;

      const midpoint = rect.left + rect.width / 2;
      const startX = direction === 'rtl' ? rect.right : rect.left;
      const endX = direction === 'rtl' ? rect.left : rect.right;

      if (hitX >= rect.left && hitX <= rect.right) {
        return direction === 'rtl'
          ? hitX > midpoint
            ? start
            : end
          : hitX <= midpoint
            ? start
            : end;
      }

      for (const candidate of [
        { offset: start, x: startX },
        { offset: end, x: endX },
      ]) {
        const distance = Math.abs(candidate.x - hitX);

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
    const owner = element?.closest<HTMLElement>('[data-plite-editor="true"]');
    const textHost = scope?.closest<HTMLElement>('[data-plite-node="text"]');

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
      }) ?? getRootEdgeCoordinatePlacement({ root, strings, x, y })
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
      element?.closest<HTMLElement>('[data-plite-node="text"]') ?? null;

    return (
      textHost?.closest<HTMLElement>(
        '[data-plite-node="element"][data-plite-path]'
      ) ?? textHost
    );
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

      const distance = getRectHorizontalDistance(rect as DOMRect, x);

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
    probe.style.contain = 'layout style paint';
    probe.style.left = `${sourceRect.left}px`;
    probe.style.pointerEvents = 'none';
    probe.style.position = 'fixed';
    probe.style.top = '0';
    probe.style.visibility = 'hidden';
    probe.style.width = `${sourceRect.width}px`;
    probe.append(textNode);
    document.body.append(probe);

    try {
      const range = document.createRange();

      range.selectNodeContents(probe);

      const lines = groupVisualLineRects(getUsableRangeRects(range));
      const line = edge === 'start' ? lines[0] : lines.at(-1);

      return line ? getTextOffsetInVisualLineByX({ line, textNode, x }) : null;
    } finally {
      probe.remove();
    }
  };

  return {
    coordinatePlacement,
    measureTextVisualLineOffset,
    pointAtCoordinates,
    pointAtVisualLineEdge,
    pointInVisualLine,
    pointRect,
    rangeRect,
    visualLineHost,
    visualLines,
  };
};
