const CSS_BREAK_WHITESPACE_PATTERN = /^[\t\n\f\r ]+$/;
const STRING_EDGE_HIT_SLOP = 3;

export type SlateStringCoordinatePlacement = {
  edge: 'end' | 'start';
  offset?: number;
  rect: DOMRect;
  source: 'string-edge' | 'string-offset';
  string: HTMLElement;
} | null;

type SlateStringRectCandidate = {
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

const getSlateStringRectCandidates = ({
  event,
  strings,
}: {
  event: Pick<MouseEvent, 'clientY'>;
  strings: HTMLElement[];
}): SlateStringRectCandidate[] =>
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

export const getSlateStringDirection = (string: HTMLElement) => {
  const textHost = string.closest<HTMLElement>('[data-slate-node="text"]');
  const element =
    textHost?.closest<HTMLElement>('[data-slate-node="element"]') ??
    textHost ??
    string;
  const view = string.ownerDocument.defaultView;

  return view?.getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
};

export const getLogicalEdgeFromPhysicalEdge = (
  string: HTMLElement,
  physicalEdge: 'left' | 'right'
) => {
  const direction = getSlateStringDirection(string);

  if (direction === 'rtl') {
    return physicalEdge === 'left' ? 'end' : 'start';
  }

  return physicalEdge === 'left' ? 'start' : 'end';
};

const getPhysicalEdgeFromLogicalEdge = (
  string: HTMLElement,
  logicalEdge: 'end' | 'start'
) => {
  const direction = getSlateStringDirection(string);

  if (direction === 'rtl') {
    return logicalEdge === 'start' ? 'right' : 'left';
  }

  return logicalEdge === 'start' ? 'left' : 'right';
};

export const getSlateStringLength = (string: HTMLElement) => {
  const lengthAttribute = string.getAttribute('data-slate-length');
  const length =
    lengthAttribute === null ? null : Number.parseInt(lengthAttribute, 10);

  if (length !== null && Number.isFinite(length)) {
    return length;
  }

  if (string.hasAttribute('data-slate-zero-width')) {
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

const isNextSlateStringSegmentOutsideLine = ({
  range,
  rect,
  string,
}: {
  range: globalThis.Range | Range;
  rect: DOMRect;
  string: HTMLElement;
}) => {
  const textHost = string.closest<HTMLElement>('[data-slate-node="text"]');
  const scope = textHost?.parentElement ?? textHost;

  if (!scope) {
    return false;
  }

  const strings = Array.from(
    scope.querySelectorAll<HTMLElement>(
      '[data-slate-string], [data-slate-zero-width]'
    )
  );
  const stringIndex = strings.indexOf(string);

  if (stringIndex === -1) {
    return false;
  }

  for (const nextString of strings.slice(stringIndex + 1)) {
    if (nextString.hasAttribute('data-slate-zero-width')) {
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
        isNextSlateStringSegmentOutsideLine({ range, rect, string })))
    ? start
    : end;
};

export const getSlateStringLineEdgeTextOffset = ({
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
    return edge === 'start' ? 0 : getSlateStringLength(string);
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

export const getSlateStringLineOffsetAtX = ({
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

  const direction = getSlateStringDirection(string);
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

export const getSlateStringCoordinatePlacement = ({
  includeInsideString = false,
  event,
  strings,
}: {
  includeInsideString?: boolean;
  event: Pick<MouseEvent, 'clientX' | 'clientY'>;
  strings: HTMLElement[];
}): SlateStringCoordinatePlacement => {
  const nearestString = getSlateStringRectCandidates({
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
    const offset = getSlateStringLineOffsetAtX({
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
