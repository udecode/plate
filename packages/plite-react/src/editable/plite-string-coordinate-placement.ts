import {
  getPliteStringLength,
  getPliteStringLineEdgeTextOffset,
  getPliteStringCoordinatePlacement as resolvePliteStringCoordinatePlacement,
} from '@platejs/plite-dom/internal';

export { getPliteStringCoordinatePlacement } from '@platejs/plite-dom/internal';

export type PliteStringCoordinatePlacement = {
  edge: 'end' | 'start';
  offset?: number;
  rect: DOMRect;
  source: 'root-edge' | 'string-edge' | 'string-offset';
  string: HTMLElement;
} | null;

export type PliteStringPlacementDOMPoint = {
  node: globalThis.Node;
  offset: number;
};

type PliteStringRectCandidate = {
  rect: DOMRect;
  string: HTMLElement;
  verticalCenterDistance: number;
  verticalDistance: number;
};

const getRectVerticalDistance = (rect: DOMRect, y: number) =>
  y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;

const getRectVerticalCenterDistance = (rect: DOMRect, y: number) =>
  Math.abs(rect.top + rect.height / 2 - y);

const getRectHorizontalDistance = (rect: DOMRect, x: number) =>
  x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;

const getPliteStringCandidateHorizontalDistance = (
  candidate: PliteStringRectCandidate,
  x: number
) => getRectHorizontalDistance(candidate.rect, x);

const getPliteStringCandidateHorizontalCenterDistance = (
  candidate: PliteStringRectCandidate,
  x: number
) => Math.abs(candidate.rect.left + candidate.rect.width / 2 - x);

const getEditableRootPliteStrings = ({
  editableRoot,
  target,
}: {
  editableRoot: HTMLElement;
  target?: Element | null;
}) => {
  const targetTextHost = target?.closest<HTMLElement>(
    '[data-plite-node="text"]'
  );
  const scope =
    targetTextHost?.closest<HTMLElement>('[data-plite-editor="true"]') ===
    editableRoot
      ? targetTextHost
      : editableRoot;

  return Array.from(
    editableRoot.querySelectorAll<HTMLElement>(
      '[data-plite-string], [data-plite-zero-width]'
    )
  ).filter(
    (string) =>
      scope.contains(string) &&
      string.closest<HTMLElement>('[data-plite-editor="true"]') === editableRoot
  );
};

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

const getEditableRootEdgeCoordinatePlacement = ({
  editableRoot,
  event,
  strings,
}: {
  editableRoot: HTMLElement;
  event: Pick<MouseEvent, 'clientX' | 'clientY'>;
  strings: HTMLElement[];
}): PliteStringCoordinatePlacement => {
  const rootRect = editableRoot.getBoundingClientRect();

  if (event.clientY < rootRect.top || event.clientY > rootRect.bottom) {
    return null;
  }

  const candidates = getPliteStringRectCandidates({ event, strings });

  if (candidates.length === 0) {
    return null;
  }

  const nearestCandidate = candidates.sort((left, right) => {
    if (left.verticalDistance !== right.verticalDistance) {
      return left.verticalDistance - right.verticalDistance;
    }

    const leftHorizontalDistance = getPliteStringCandidateHorizontalDistance(
      left,
      event.clientX
    );
    const rightHorizontalDistance = getPliteStringCandidateHorizontalDistance(
      right,
      event.clientX
    );

    if (leftHorizontalDistance !== rightHorizontalDistance) {
      return leftHorizontalDistance - rightHorizontalDistance;
    }

    if (left.verticalCenterDistance !== right.verticalCenterDistance) {
      return left.verticalCenterDistance - right.verticalCenterDistance;
    }

    return (
      getPliteStringCandidateHorizontalCenterDistance(left, event.clientX) -
      getPliteStringCandidateHorizontalCenterDistance(right, event.clientX)
    );
  })[0];

  if (!nearestCandidate) {
    return null;
  }

  const firstTop = Math.min(
    ...candidates.map((candidate) => candidate.rect.top)
  );
  const lastBottom = Math.max(
    ...candidates.map((candidate) => candidate.rect.bottom)
  );
  const nearestHorizontalDistance = getRectHorizontalDistance(
    nearestCandidate.rect,
    event.clientX
  );

  if (
    event.clientY < nearestCandidate.rect.top &&
    (event.clientY < firstTop || nearestHorizontalDistance === 0)
  ) {
    return {
      edge: 'start',
      rect: nearestCandidate.rect,
      source: 'root-edge',
      string: nearestCandidate.string,
    };
  }

  if (
    event.clientY > nearestCandidate.rect.bottom &&
    (event.clientY > lastBottom || nearestHorizontalDistance === 0)
  ) {
    return {
      edge: 'end',
      rect: nearestCandidate.rect,
      source: 'root-edge',
      string: nearestCandidate.string,
    };
  }

  return null;
};

export const getEditableRootPliteStringCoordinatePlacement = ({
  editableRoot,
  event,
  includeInsideString = false,
  target,
}: {
  editableRoot: HTMLElement;
  event: MouseEvent;
  includeInsideString?: boolean;
  target?: Element | null;
}): PliteStringCoordinatePlacement => {
  const strings = getEditableRootPliteStrings({ editableRoot, target });

  return (
    resolvePliteStringCoordinatePlacement({
      event,
      includeInsideString,
      strings,
    }) ??
    getEditableRootEdgeCoordinatePlacement({
      editableRoot,
      event,
      strings,
    })
  );
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

    if (!Number.isFinite(leafStart) || !Number.isFinite(leafEnd)) {
      return null;
    }

    return Math.max(leafStart, Math.min(leafStart + stringOffset, leafEnd));
  }

  let offset = 0;

  for (const candidate of Array.from(
    textHost.querySelectorAll<HTMLElement>(
      '[data-plite-string], [data-plite-zero-width]'
    )
  )) {
    const length = getPliteStringLength(candidate);

    if (candidate === string) {
      return offset + stringOffset;
    }

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
    offset: getPliteStringLineEdgeTextOffset({
      edge,
      rect,
      string,
    }),
    string,
    textHost,
  });

export const getPliteStringPlacementDOMPoint = (
  placement: NonNullable<PliteStringCoordinatePlacement>
): PliteStringPlacementDOMPoint | null => {
  const textNode = Array.from(placement.string.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE
  );

  if (!textNode) {
    return null;
  }

  const textLength = textNode.textContent?.length ?? 0;
  const offset =
    placement.offset ??
    getPliteStringLineEdgeTextOffset({
      edge: placement.edge,
      rect: placement.rect,
      string: placement.string,
    });

  return {
    node: textNode,
    offset: Math.max(0, Math.min(offset, textLength)),
  };
};
