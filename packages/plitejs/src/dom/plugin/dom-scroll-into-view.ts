import {
  type DOMRange,
  getFlatTreeParentElement,
  isDOMElement,
  isDOMHTMLElement,
} from '../utils/dom';

export type ScrollRect = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

const MARGIN = 4;
const SCROLLABLE_RE = /(auto|scroll|overlay)/;

export const isUsableScrollRect = (r: DOMRect | DOMRectReadOnly) =>
  r.width > 0 ||
  r.height > 0 ||
  r.x !== 0 ||
  r.y !== 0 ||
  r.top !== 0 ||
  r.left !== 0 ||
  r.bottom !== 0 ||
  r.right !== 0;

export const toScrollRect = (r: DOMRect | DOMRectReadOnly): ScrollRect => ({
  bottom: r.bottom,
  left: r.left,
  right: r.right,
  top: r.top,
});

const shiftRect = (r: ScrollRect, dx: number, dy: number): ScrollRect => ({
  bottom: r.bottom - dy,
  left: r.left - dx,
  right: r.right - dx,
  top: r.top - dy,
});

const canScroll = (
  el: Element,
  style: CSSStyleDeclaration | undefined,
  axis: 'x' | 'y'
) => {
  const overflow =
    axis === 'y'
      ? `${style?.overflowY ?? ''} ${style?.overflow ?? ''}`
      : `${style?.overflowX ?? ''} ${style?.overflow ?? ''}`;

  return (
    SCROLLABLE_RE.test(overflow) &&
    (axis === 'y'
      ? el.scrollHeight > el.clientHeight
      : el.scrollWidth > el.clientWidth)
  );
};

const pad = (value: string | undefined, size: number) => {
  const n = Number.parseFloat(value ?? '');

  if (!Number.isFinite(n) || n <= 0) return 0;

  return value?.trim().endsWith('%') ? (n / 100) * size : n;
};

const paddedBox = (
  rect: {
    bottom: number;
    height: number;
    left: number;
    right: number;
    top: number;
    width: number;
  },
  style: CSSStyleDeclaration | undefined
): ScrollRect => ({
  bottom: rect.bottom - pad(style?.scrollPaddingBottom, rect.height) - MARGIN,
  left: rect.left + pad(style?.scrollPaddingLeft, rect.width) + MARGIN,
  right: rect.right - pad(style?.scrollPaddingRight, rect.width) - MARGIN,
  top: rect.top + pad(style?.scrollPaddingTop, rect.height) + MARGIN,
});

// Chrome reports client rects in layout-viewport space (pageTop - scrollY = offsetTop),
// while iOS Safari reports them in visual-viewport space (pageTop - scrollY ~= 0).
// Clamping pageTop - scrollY to [0, offsetTop] matches the visible box on both without UA checks.
const getVisibleViewportBox = (
  win: Window,
  scrollingElement: Element
): ScrollRect => {
  const vv = win.visualViewport;
  const height = vv?.height ?? win.innerHeight;
  const width = vv?.width ?? win.innerWidth;
  const top = vv
    ? Math.min(Math.max(0, vv.pageTop - win.scrollY), Math.max(0, vv.offsetTop))
    : 0;
  const left = vv
    ? Math.min(
        Math.max(0, vv.pageLeft - win.scrollX),
        Math.max(0, vv.offsetLeft)
      )
    : 0;

  return paddedBox(
    { bottom: top + height, height, left, right: left + width, top, width },
    win.getComputedStyle(scrollingElement)
  );
};

const axisDelta = (
  start: number,
  end: number,
  low: number,
  high: number,
  ownLow?: number,
  ownHigh?: number
) => {
  if (low >= high) return 0;
  if (start < low) {
    const d = low - start;

    return ownHigh === undefined
      ? -d
      : -Math.min(d, Math.max(0, ownHigh - end));
  }
  if (end > high) {
    const d = end - high;

    return ownLow === undefined ? d : Math.min(d, Math.max(0, start - ownLow));
  }

  return 0;
};

const scrollAncestors = (
  startElement: Element,
  scrollingElement: Element,
  rect: ScrollRect,
  visibleBox: ScrollRect | null
) => {
  let cur = rect;

  for (
    let el = getFlatTreeParentElement(startElement);
    el;
    el = getFlatTreeParentElement(el)
  ) {
    if (el === scrollingElement) continue;

    const style = el.ownerDocument.defaultView?.getComputedStyle(el);
    const scrollY = canScroll(el, style, 'y');
    const scrollX = canScroll(el, style, 'x');

    if (!scrollY && !scrollX) continue;

    const own = paddedBox(el.getBoundingClientRect(), style);
    const dy = scrollY
      ? visibleBox
        ? axisDelta(
            cur.top,
            cur.bottom,
            Math.max(own.top, visibleBox.top),
            Math.min(own.bottom, visibleBox.bottom),
            own.top,
            own.bottom
          )
        : axisDelta(cur.top, cur.bottom, own.top, own.bottom)
      : 0;
    const dx = scrollX
      ? visibleBox
        ? axisDelta(
            cur.left,
            cur.right,
            Math.max(own.left, visibleBox.left),
            Math.min(own.right, visibleBox.right),
            own.left,
            own.right
          )
        : axisDelta(cur.left, cur.right, own.left, own.right)
      : 0;

    if (dy === 0 && dx === 0) continue;

    const prevTop = el.scrollTop;
    const prevLeft = el.scrollLeft;

    el.scrollTop += dy;
    el.scrollLeft += dx;
    cur = shiftRect(cur, el.scrollLeft - prevLeft, el.scrollTop - prevTop);
  }

  return cur;
};

const outsideBox = (rect: ScrollRect, box: ScrollRect, tolerance = 0) =>
  rect.top < box.top - tolerance ||
  rect.bottom > box.bottom + tolerance ||
  rect.left < box.left - tolerance ||
  rect.right > box.right + tolerance;

// Blink's window.scrollBy only moves the layout viewport, so when the soft
// keyboard shrinks the visual viewport (resizes-visual) and scrollY clamps at
// scrollHeight - clientHeight, only scrollIntoView pans visualViewport.offsetTop.
const panVisualViewport = (
  win: Window,
  scrollingElement: Element,
  el: Element,
  caret: ScrollRect
) => {
  const vv = win.visualViewport;

  if (
    !vv ||
    !isDOMHTMLElement(el) ||
    (vv.height >= scrollingElement.clientHeight &&
      vv.width >= scrollingElement.clientWidth)
  ) {
    return;
  }

  const elRect = el.getBoundingClientRect();
  const prev = el.style.getPropertyValue('scroll-margin');
  const priority = el.style.getPropertyPriority('scroll-margin');

  el.style.setProperty(
    'scroll-margin',
    `${MARGIN - (caret.top - elRect.top)}px ${MARGIN - (elRect.right - caret.right)}px ${MARGIN - (elRect.bottom - caret.bottom)}px ${MARGIN - (caret.left - elRect.left)}px`
  );
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' });

  if (prev) el.style.setProperty('scroll-margin', prev, priority);
  else el.style.removeProperty('scroll-margin');
};

export const scrollRectIntoViewIfNeeded = ({
  rect,
  startElement,
}: {
  rect: ScrollRect;
  startElement: Element;
}) => {
  const scrollingElement =
    startElement.ownerDocument.scrollingElement ??
    startElement.ownerDocument.documentElement;
  let cur = scrollAncestors(startElement, scrollingElement, rect, null);
  const win = startElement.ownerDocument.defaultView;

  if (!win) return;

  let visible = getVisibleViewportBox(win, scrollingElement);
  const dy =
    scrollingElement.scrollHeight > scrollingElement.clientHeight
      ? axisDelta(cur.top, cur.bottom, visible.top, visible.bottom)
      : 0;
  const dx =
    scrollingElement.scrollWidth > scrollingElement.clientWidth
      ? axisDelta(cur.left, cur.right, visible.left, visible.right)
      : 0;

  if (dy !== 0 || dx !== 0) {
    const prevY = win.scrollY;
    const prevX = win.scrollX;

    win.scrollBy(dx, dy);
    cur = shiftRect(cur, win.scrollX - prevX, win.scrollY - prevY);
    visible = getVisibleViewportBox(win, scrollingElement);
  }

  if (outsideBox(cur, visible)) {
    cur = scrollAncestors(startElement, scrollingElement, cur, visible);
  }

  if (outsideBox(cur, visible, 1)) {
    panVisualViewport(win, scrollingElement, startElement, cur);
  }
};

export const scrollDOMRangeFocusIntoViewIfNeeded = (
  domRange: DOMRange,
  isBackward = false
) => {
  const focusRange = domRange.cloneRange();
  focusRange.collapse(isBackward);

  const container = focusRange.startContainer;
  const leafEl = isDOMElement(container) ? container : container.parentElement;

  if (!leafEl) return;

  // jsdom's Range has no getBoundingClientRect.
  if (typeof focusRange.getBoundingClientRect !== 'function') return;

  // COMPAT: In Chrome, collapsed range getBoundingClientRect() can return all zeros on empty lines.
  const domRect = focusRange.getBoundingClientRect();
  const targetRect = isUsableScrollRect(domRect)
    ? domRect
    : leafEl.getBoundingClientRect();

  if (!isUsableScrollRect(targetRect)) return;

  scrollRectIntoViewIfNeeded({
    rect: toScrollRect(targetRect),
    startElement: leafEl,
  });
};
