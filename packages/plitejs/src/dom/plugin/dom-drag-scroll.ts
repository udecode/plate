import { getFlatTreeParentElement } from '../utils/dom';
import type { DOMGeometryRect } from './dom-geometry';

const DRAG_AUTOSCROLL_EDGE_SIZE = 48;
const DRAG_AUTOSCROLL_MAX_DELTA = 28;
const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;
const CLIPPING_OVERFLOW_PATTERN = /^(auto|clip|hidden|overlay|scroll)$/;
const POSITIONED_PATTERN = /^(absolute|fixed|relative|sticky)$/;
const CONTAINING_CONTAIN_PATTERN = /\b(content|layout|paint|strict)\b/;
const CONTAINING_WILL_CHANGE_PATTERN = /\b(filter|perspective|transform)\b/;

const clampDragAutoScrollCoordinate = (
  value: number,
  min: number,
  max: number
) => Math.min(Math.max(value, min), Math.max(min, max - 1));

const canScrollY = (element: Element) => {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const overflowY = style?.overflowY ?? '';

  return (
    SCROLLABLE_OVERFLOW_PATTERN.test(overflowY) &&
    element.scrollHeight > element.clientHeight
  );
};

const isSet = (value: string | undefined) => !!value && value !== 'none';

// CSS makes a box with any of these the containing block of its fixed and
// absolute descendants.
const isContainingBlock = (style: CSSStyleDeclaration) =>
  isSet(style.transform) ||
  isSet(style.perspective) ||
  isSet(style.filter) ||
  isSet(style.getPropertyValue('backdrop-filter')) ||
  CONTAINING_CONTAIN_PATTERN.test(style.contain ?? '') ||
  CONTAINING_WILL_CHANGE_PATTERN.test(style.willChange ?? '');

const clipsAxes = (style: CSSStyleDeclaration) => {
  const clips = style.display !== 'contents' && style.display !== 'inline';

  return {
    x: clips && CLIPPING_OVERFLOW_PATTERN.test(style.overflowX),
    y: clips && CLIPPING_OVERFLOW_PATTERN.test(style.overflowY),
  };
};

type ClipBox = Readonly<{
  clientHeight: number;
  clientLeft: number;
  clientTop: number;
  clientWidth: number;
  element: Element;
  offsetHeight: number | undefined;
  offsetWidth: number | undefined;
  x: boolean;
  y: boolean;
}>;

type VisitedBox = Readonly<{ element: Element; parent: Element | null }>;

export type ClipChain = Readonly<{
  boxes: readonly ClipBox[];
  element: Element;
  visited: readonly VisitedBox[];
}>;

const readClipBox = (
  element: Element,
  axes: { x: boolean; y: boolean }
): ClipBox => {
  const { offsetHeight, offsetWidth } = element as Partial<HTMLElement>;

  return {
    clientHeight: element.clientHeight,
    clientLeft: element.clientLeft,
    clientTop: element.clientTop,
    clientWidth: element.clientWidth,
    element,
    offsetHeight,
    offsetWidth,
    ...axes,
  };
};

export const walkClipChain = (
  element: Element,
  { self = false }: { self?: boolean } = {}
): ClipChain | null => {
  const document = element.ownerDocument;
  const view = document.defaultView;

  if (!view) return null;

  const boxes: ClipBox[] = [];
  const ownStyle = view.getComputedStyle(element);
  let { position } = ownStyle;
  let parent = getFlatTreeParentElement(element);
  const visited: VisitedBox[] = [{ element, parent }];

  if (self) {
    const axes = clipsAxes(ownStyle);

    if (axes.x || axes.y) boxes.push(readClipBox(element, axes));
  }

  while (
    parent &&
    parent !== document.body &&
    parent !== document.documentElement
  ) {
    const next = getFlatTreeParentElement(parent);
    const style = view.getComputedStyle(parent);

    const escapes =
      (position === 'fixed' ||
        (position === 'absolute' &&
          !POSITIONED_PATTERN.test(style.position))) &&
      !isContainingBlock(style);

    visited.push({ element: parent, parent: next });
    if (!escapes) {
      const axes = clipsAxes(style);

      if (axes.x || axes.y) boxes.push(readClipBox(parent, axes));
      ({ position } = style);
    }
    parent = next;
  }

  return { boxes, element, visited };
};

export const intersectClipChain = (
  chain: ClipChain,
  rect: Readonly<DOMGeometryRect>
): DOMGeometryRect | null => {
  const { clientHeight, clientWidth } =
    chain.element.ownerDocument.documentElement;
  let left = Math.max(rect.left, 0);
  let top = Math.max(rect.top, 0);
  let right = Math.min(rect.right, clientWidth);
  let bottom = Math.min(rect.bottom, clientHeight);

  for (const box of chain.boxes) {
    const clip = box.element.getBoundingClientRect();
    const scaleX = box.offsetWidth ? clip.width / box.offsetWidth : 1;
    const scaleY = box.offsetHeight ? clip.height / box.offsetHeight : 1;

    if (box.x) {
      const clipLeft = clip.left + box.clientLeft * scaleX;

      left = Math.max(left, clipLeft);
      right = Math.min(right, clipLeft + box.clientWidth * scaleX);
    }
    if (box.y) {
      const clipTop = clip.top + box.clientTop * scaleY;

      top = Math.max(top, clipTop);
      bottom = Math.min(bottom, clipTop + box.clientHeight * scaleY);
    }
  }

  return right > left && bottom > top
    ? { bottom, height: bottom - top, left, right, top, width: right - left }
    : null;
};

export const getVisibleRect = (element: Element): DOMGeometryRect | null => {
  const chain = walkClipChain(element);

  return chain
    ? intersectClipChain(chain, element.getBoundingClientRect())
    : null;
};

const getDragAutoScrollDelta = (clientY: number, box: DOMGeometryRect) => {
  const edgeSize = Math.min(DRAG_AUTOSCROLL_EDGE_SIZE, box.height / 2);
  const topDistance = clientY - box.top;
  const bottomDistance = box.bottom - clientY;

  if (topDistance < edgeSize) {
    const intensity = 1 - Math.max(0, topDistance) / edgeSize;

    return -Math.max(1, Math.ceil(intensity * DRAG_AUTOSCROLL_MAX_DELTA));
  }

  if (bottomDistance < edgeSize) {
    const intensity = 1 - Math.max(0, bottomDistance) / edgeSize;

    return Math.max(1, Math.ceil(intensity * DRAG_AUTOSCROLL_MAX_DELTA));
  }

  return 0;
};

type DragScroller = Readonly<{
  box: DOMGeometryRect;
  maxScrollTop: number;
  scrollBy: (delta: number) => void;
  scrollTop: () => number;
}>;

function* getDragScrollers(rootElement: HTMLElement): Generator<DragScroller> {
  for (
    let parent: Element | null = rootElement;
    parent;
    parent = getFlatTreeParentElement(parent)
  ) {
    if (!canScrollY(parent)) continue;

    const box = getVisibleRect(parent);

    if (!box) continue;

    const scroller = parent;

    yield {
      box,
      maxScrollTop: scroller.scrollHeight - scroller.clientHeight,
      scrollBy: (delta) => {
        scroller.scrollTop += delta;
      },
      scrollTop: () => scroller.scrollTop,
    };
  }

  const document = rootElement.ownerDocument;
  const window = document.defaultView;
  const { scrollingElement } = document;

  if (
    !window ||
    !scrollingElement ||
    scrollingElement.scrollHeight <= scrollingElement.clientHeight
  ) {
    return;
  }

  const { clientHeight, clientWidth } = document.documentElement;

  yield {
    box: {
      bottom: clientHeight,
      height: clientHeight,
      left: 0,
      right: clientWidth,
      top: 0,
      width: clientWidth,
    },
    maxScrollTop: scrollingElement.scrollHeight - scrollingElement.clientHeight,
    scrollBy: (delta) => window.scrollBy(0, delta),
    scrollTop: () => scrollingElement.scrollTop,
  };
}

export const getDragAutoScrollTarget = ({
  clientX,
  clientY,
  rootElement,
}: {
  clientX: number;
  clientY: number;
  rootElement: HTMLElement;
}): null | {
  clientX: number;
  clientY: number;
  delta: number;
  scroll: () => number;
} => {
  for (const { box, maxScrollTop, scrollBy, scrollTop } of getDragScrollers(
    rootElement
  )) {
    if (clientX < box.left || clientX > box.right) continue;

    const delta = getDragAutoScrollDelta(clientY, box);

    if (delta === 0) continue;

    const canMove = delta < 0 ? scrollTop() > 0 : scrollTop() < maxScrollTop;

    if (!canMove) continue;

    return {
      clientX: clampDragAutoScrollCoordinate(clientX, box.left, box.right),
      clientY: clampDragAutoScrollCoordinate(clientY, box.top, box.bottom),
      delta,
      scroll: () => {
        const previousScrollTop = scrollTop();

        scrollBy(delta);

        return scrollTop() - previousScrollTop;
      },
    };
  }

  return null;
};
