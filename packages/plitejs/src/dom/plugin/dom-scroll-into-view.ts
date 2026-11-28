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

type ScrollIntoViewMode = 'always' | 'if-needed';

/** Extra viewport clearance around a scrolled target, in pixels. */
export type ScrollMargin =
  | number
  | Readonly<{
      bottom?: number;
      left?: number;
      right?: number;
      top?: number;
    }>;

/** Options controlling how `scrollIntoView` aligns and clears a target rect. */
export type ScrollIntoViewOptions =
  | boolean
  | {
      behavior?: ScrollBehavior;
      block?: ScrollLogicalPosition;
      boundary?: Element | ((parent: Element) => boolean) | null;
      inline?: ScrollLogicalPosition;
      /** Extra clearance around the target rect in pixels, merged with CSS scroll-margin via Math.max. */
      scrollMargin?: ScrollMargin;
      scrollMode?: 'always' | 'if-needed';
      skipOverflowHiddenElements?: boolean;
    };

type ResolvedScrollMargin = Readonly<{
  bottom: number;
  left: number;
  right: number;
  top: number;
}>;

type NormalizedScrollOptions = {
  behavior: ScrollBehavior;
  block: ScrollLogicalPosition;
  boundary: Element | ((parent: Element) => boolean) | null;
  defaultReveal: boolean;
  inline: ScrollLogicalPosition;
  scrollMargin: ResolvedScrollMargin;
  scrollMode: ScrollIntoViewMode;
  skipOverflowHiddenElements: boolean;
};

const ZERO_SCROLL_MARGIN: ResolvedScrollMargin = {
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
};

const clampMarginPx = (value: number | undefined) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;

export const resolveScrollMargin = (
  margin: ScrollMargin | undefined
): ResolvedScrollMargin => {
  if (margin === undefined) return ZERO_SCROLL_MARGIN;
  if (typeof margin === 'number') {
    const px = clampMarginPx(margin);

    return { bottom: px, left: px, right: px, top: px };
  }

  return {
    bottom: clampMarginPx(margin.bottom),
    left: clampMarginPx(margin.left),
    right: clampMarginPx(margin.right),
    top: clampMarginPx(margin.top),
  };
};

const MARGIN = 4;
const MAX_IFRAME_DEPTH = 16;
const SCROLLABLE_RE = /(auto|scroll|overlay)/;
const HIDDEN_OVERFLOW_RE = /\bhidden\b/;

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

const hasOnlyDefaultRevealKeys = (
  options: Exclude<ScrollIntoViewOptions, boolean>
) =>
  (options.scrollMode === undefined || options.scrollMode === 'if-needed') &&
  options.block === undefined &&
  options.inline === undefined &&
  options.behavior === undefined &&
  options.boundary === undefined &&
  options.skipOverflowHiddenElements === undefined;

export const isDefaultScrollRevealOptions = (
  options: ScrollIntoViewOptions | undefined
) =>
  options === undefined ||
  (typeof options === 'object' &&
    options !== null &&
    options.scrollMargin === undefined &&
    hasOnlyDefaultRevealKeys(options));

const normalizeOptions = (
  options: ScrollIntoViewOptions | undefined
): NormalizedScrollOptions => {
  if (options === undefined) {
    return {
      behavior: 'auto',
      block: 'nearest',
      boundary: null,
      defaultReveal: true,
      inline: 'nearest',
      scrollMargin: ZERO_SCROLL_MARGIN,
      scrollMode: 'if-needed',
      skipOverflowHiddenElements: true,
    };
  }

  if (typeof options === 'boolean') {
    return {
      behavior: 'auto',
      block: options ? 'start' : 'end',
      boundary: null,
      defaultReveal: false,
      inline: 'nearest',
      scrollMargin: ZERO_SCROLL_MARGIN,
      scrollMode: 'always',
      skipOverflowHiddenElements: true,
    };
  }

  if (hasOnlyDefaultRevealKeys(options)) {
    return {
      behavior: 'auto',
      block: 'nearest',
      boundary: null,
      defaultReveal: options.scrollMargin === undefined,
      inline: 'nearest',
      scrollMargin: resolveScrollMargin(options.scrollMargin),
      scrollMode: 'if-needed',
      skipOverflowHiddenElements: true,
    };
  }

  const scrollMode: ScrollIntoViewMode = options.scrollMode ?? 'always';

  return {
    behavior: options.behavior ?? 'auto',
    block: options.block ?? (scrollMode === 'always' ? 'center' : 'nearest'),
    boundary: options.boundary ?? null,
    defaultReveal: false,
    inline: options.inline ?? 'nearest',
    scrollMargin: resolveScrollMargin(options.scrollMargin),
    scrollMode,
    skipOverflowHiddenElements: options.skipOverflowHiddenElements ?? true,
  };
};

const shiftRect = (r: ScrollRect, dx: number, dy: number): ScrollRect => ({
  bottom: r.bottom - dy,
  left: r.left - dx,
  right: r.right - dx,
  top: r.top - dy,
});

const parsePositivePx = (value: string | undefined) => {
  const n = Number.parseFloat(value ?? '');

  return Number.isFinite(n) && n > 0 ? n : 0;
};

const getElementStyle = (element: Element) =>
  element.ownerDocument.defaultView?.getComputedStyle(element) ??
  (isDOMHTMLElement(element) ? element.style : undefined);

const readScrollMargins = (
  element: Element,
  scrollMarginTopOverride?: number
) => {
  const style = getElementStyle(element);
  const inlineStyle = isDOMHTMLElement(element) ? element.style : undefined;
  const top =
    scrollMarginTopOverride !== undefined
      ? Math.max(0, scrollMarginTopOverride)
      : parsePositivePx(inlineStyle?.scrollMarginTop || style?.scrollMarginTop);

  return {
    bottom: parsePositivePx(
      inlineStyle?.scrollMarginBottom || style?.scrollMarginBottom
    ),
    left: parsePositivePx(
      inlineStyle?.scrollMarginLeft || style?.scrollMarginLeft
    ),
    right: parsePositivePx(
      inlineStyle?.scrollMarginRight || style?.scrollMarginRight
    ),
    top,
  };
};

const canScroll = (
  el: Element,
  style: CSSStyleDeclaration | undefined,
  axis: 'x' | 'y',
  skipOverflowHiddenElements: boolean
) => {
  const overflow =
    axis === 'y'
      ? `${style?.overflowY ?? ''} ${style?.overflow ?? ''}`
      : `${style?.overflowX ?? ''} ${style?.overflow ?? ''}`;
  const overflowAllows =
    SCROLLABLE_RE.test(overflow) ||
    (!skipOverflowHiddenElements && HIDDEN_OVERFLOW_RE.test(overflow));

  return (
    overflowAllows &&
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
  style: CSSStyleDeclaration | undefined,
  margin: number,
  scaleX = 1,
  scaleY = 1
): ScrollRect => ({
  bottom:
    rect.bottom -
    pad(style?.scrollPaddingBottom, rect.height / scaleY) * scaleY -
    margin,
  left:
    rect.left +
    pad(style?.scrollPaddingLeft, rect.width / scaleX) * scaleX +
    margin,
  right:
    rect.right -
    pad(style?.scrollPaddingRight, rect.width / scaleX) * scaleX -
    margin,
  top:
    rect.top +
    pad(style?.scrollPaddingTop, rect.height / scaleY) * scaleY +
    margin,
});

const getElementScale = (el: Element, rect: DOMRectReadOnly) => {
  if (!isDOMHTMLElement(el)) return { x: 1, y: 1 };

  return {
    x: el.offsetWidth > 0 && rect.width > 0 ? rect.width / el.offsetWidth : 1,
    y:
      el.offsetHeight > 0 && rect.height > 0
        ? rect.height / el.offsetHeight
        : 1,
  };
};

const getScrollContainerBox = (
  el: Element,
  style: CSSStyleDeclaration | undefined,
  scale: { x: number; y: number },
  margin: number
): ScrollRect => {
  const rect = el.getBoundingClientRect();
  const borderTop = parsePositivePx(style?.borderTopWidth) * scale.y;
  const borderBottom = parsePositivePx(style?.borderBottomWidth) * scale.y;
  const borderLeft = parsePositivePx(style?.borderLeftWidth) * scale.x;
  const borderRight = parsePositivePx(style?.borderRightWidth) * scale.x;
  const top = rect.top + borderTop;
  const bottom =
    el.clientHeight > 0
      ? Math.min(rect.bottom - borderBottom, top + el.clientHeight * scale.y)
      : rect.bottom - borderBottom;
  const isRtl = style?.direction === 'rtl';
  const left =
    isRtl && el.clientWidth > 0
      ? Math.max(
          rect.left + borderLeft,
          rect.right - borderRight - el.clientWidth * scale.x
        )
      : rect.left + borderLeft;
  const right =
    !isRtl && el.clientWidth > 0
      ? Math.min(rect.right - borderRight, left + el.clientWidth * scale.x)
      : rect.right - borderRight;

  return paddedBox(
    {
      bottom,
      height: Math.max(0, bottom - top),
      left,
      right,
      top,
      width: Math.max(0, right - left),
    },
    style,
    margin,
    scale.x,
    scale.y
  );
};

// Chrome reports client rects in layout-viewport space (pageTop - scrollY = offsetTop),
// while iOS Safari reports them in visual-viewport space (pageTop - scrollY ~= 0).
// Clamping pageTop - scrollY to [0, offsetTop] matches the visible box on both without UA checks.
const getVisibleViewportBox = (
  win: Window,
  scrollingElement: Element,
  margin: number
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
    win.getComputedStyle(scrollingElement),
    margin
  );
};

const axisDelta = ({
  align,
  end,
  high,
  low,
  ownHigh,
  ownLow,
  rtl = false,
  scrollMode,
  start,
}: {
  align: ScrollLogicalPosition;
  end: number;
  high: number;
  low: number;
  ownHigh?: number;
  ownLow?: number;
  rtl?: boolean;
  scrollMode: ScrollIntoViewMode;
  start: number;
}) => {
  if (low >= high) return 0;
  if (scrollMode === 'if-needed' && start >= low && end <= high) return 0;

  if (align === 'start') {
    return rtl ? end - high : start - low;
  }
  if (align === 'end') {
    return rtl ? start - low : end - high;
  }
  if (align === 'center') {
    return (start + end) / 2 - (low + high) / 2;
  }

  if (start < low && end > high) return 0;
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

const applyElementScroll = (
  el: Element,
  dx: number,
  dy: number,
  behavior: ScrollBehavior
) => {
  const prevLeft = el.scrollLeft;
  const prevTop = el.scrollTop;
  const nextLeft = prevLeft + dx;
  const nextTop = prevTop + dy;

  if (behavior === 'smooth' && typeof el.scroll === 'function') {
    el.scroll({ behavior, left: nextLeft, top: nextTop });

    return { dx, dy };
  }

  if (typeof el.scroll === 'function') {
    el.scroll({ behavior, left: nextLeft, top: nextTop });
  }
  if (el.scrollTop === prevTop && dy !== 0) {
    el.scrollTop = nextTop;
  }
  if (el.scrollLeft === prevLeft && dx !== 0) {
    el.scrollLeft = nextLeft;
  }

  return {
    dx: el.scrollLeft - prevLeft,
    dy: el.scrollTop - prevTop,
  };
};

const scrollAncestors = (
  startElement: Element,
  scrollingElement: Element,
  rect: ScrollRect,
  visibleBox: ScrollRect | null,
  options: NormalizedScrollOptions
): { cur: ScrollRect; stopped: boolean } => {
  let cur = rect;
  const margin = options.defaultReveal ? MARGIN : 0;
  const startStyle = getElementStyle(startElement);

  if (startStyle?.position === 'fixed') {
    return { cur, stopped: true };
  }

  if (options.boundary === startElement) {
    return { cur, stopped: true };
  }

  for (
    let el = getFlatTreeParentElement(startElement);
    el;
    el = getFlatTreeParentElement(el)
  ) {
    if (typeof options.boundary === 'function' && !options.boundary(el)) {
      return { cur, stopped: true };
    }
    if (el === scrollingElement) {
      return { cur, stopped: options.boundary === el };
    }

    const style = getElementStyle(el);
    const scrollY = canScroll(
      el,
      style,
      'y',
      options.skipOverflowHiddenElements
    );
    const scrollX = canScroll(
      el,
      style,
      'x',
      options.skipOverflowHiddenElements
    );

    if (scrollY || scrollX) {
      const scale = getElementScale(el, el.getBoundingClientRect());
      const own = getScrollContainerBox(el, style, scale, margin);
      const isRtl = style?.direction === 'rtl';
      const dy = scrollY
        ? visibleBox
          ? axisDelta({
              align: 'nearest',
              end: cur.bottom,
              high: Math.min(own.bottom, visibleBox.bottom),
              low: Math.max(own.top, visibleBox.top),
              ownHigh: own.bottom,
              ownLow: own.top,
              scrollMode: 'if-needed',
              start: cur.top,
            })
          : axisDelta({
              align: options.block,
              end: cur.bottom,
              high: own.bottom,
              low: own.top,
              scrollMode: options.scrollMode,
              start: cur.top,
            })
        : 0;
      const dx = scrollX
        ? visibleBox
          ? axisDelta({
              align: 'nearest',
              end: cur.right,
              high: Math.min(own.right, visibleBox.right),
              low: Math.max(own.left, visibleBox.left),
              ownHigh: own.right,
              ownLow: own.left,
              rtl: isRtl,
              scrollMode: 'if-needed',
              start: cur.left,
            })
          : axisDelta({
              align: options.inline,
              end: cur.right,
              high: own.right,
              low: own.left,
              rtl: isRtl,
              scrollMode: options.scrollMode,
              start: cur.left,
            })
        : 0;

      if (dy !== 0 || dx !== 0) {
        const applied = applyElementScroll(
          el,
          dx / scale.x,
          dy / scale.y,
          options.behavior
        );

        cur = shiftRect(cur, applied.dx * scale.x, applied.dy * scale.y);
      }
    }

    if (style?.position === 'fixed' || options.boundary === el) {
      return { cur, stopped: true };
    }
  }

  return { cur, stopped: false };
};

const outsideBox = (rect: ScrollRect, box: ScrollRect, tolerance = 0) =>
  rect.top < box.top - tolerance ||
  rect.bottom > box.bottom + tolerance ||
  rect.left < box.left - tolerance ||
  rect.right > box.right + tolerance;

const setCaretScrollMargin = (
  el: HTMLElement,
  elRect: DOMRect,
  caret: ScrollRect,
  top: number,
  right: number,
  bottom: number,
  left: number
) => {
  el.style.setProperty(
    'scroll-margin',
    `${top - (caret.top - elRect.top)}px ${right - (elRect.right - caret.right)}px ${bottom - (elRect.bottom - caret.bottom)}px ${left - (caret.left - elRect.left)}px`
  );
};

const canPanVisualViewport = (
  win: Window,
  scrollingElement: Element,
  el: Element
): el is HTMLElement => {
  const vv = win.visualViewport;

  return Boolean(
    vv &&
    isDOMHTMLElement(el) &&
    typeof el.scrollIntoView === 'function' &&
    (vv.height < scrollingElement.clientHeight ||
      vv.width < scrollingElement.clientWidth)
  );
};

// Blink's window.scrollBy only moves the layout viewport, so when the soft
// keyboard shrinks the visual viewport (resizes-visual) and scrollY clamps at
// scrollHeight - clientHeight, only scrollIntoView pans visualViewport.offsetTop.
const panVisualViewportNearest = (
  win: Window,
  scrollingElement: Element,
  el: Element,
  caret: ScrollRect,
  margin: number
): ScrollRect => {
  const vv = win.visualViewport;

  if (!vv || !canPanVisualViewport(win, scrollingElement, el)) {
    return caret;
  }

  const elRect = el.getBoundingClientRect();
  const prev = el.style.getPropertyValue('scroll-margin');
  const priority = el.style.getPropertyPriority('scroll-margin');
  const caretAfter = () => {
    const afterRect = el.getBoundingClientRect();

    return shiftRect(
      caret,
      elRect.left - afterRect.left,
      elRect.top - afterRect.top
    );
  };

  setCaretScrollMargin(el, elRect, caret, margin, margin, margin, margin);
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' });

  let nextCaret = caretAfter();

  if (
    outsideBox(
      nextCaret,
      getVisibleViewportBox(win, scrollingElement, margin),
      1
    )
  ) {
    const rootStyle = win.getComputedStyle(scrollingElement);
    const padTop = pad(rootStyle.scrollPaddingTop, vv.height);
    const padRight = pad(rootStyle.scrollPaddingRight, vv.width);
    const padBottom = pad(rootStyle.scrollPaddingBottom, vv.height);
    const padLeft = pad(rootStyle.scrollPaddingLeft, vv.width);

    if (padTop > 0 || padRight > 0 || padBottom > 0 || padLeft > 0) {
      // Blink ignores root scroll-padding when scrollIntoView pans the visual viewport;
      // fold the root padding into scroll-margin so block: 'nearest' clears fixed bars.
      setCaretScrollMargin(
        el,
        elRect,
        caret,
        margin + padTop,
        margin + padRight,
        margin + padBottom,
        margin + padLeft
      );
      el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      nextCaret = caretAfter();
    }
  }

  if (prev) el.style.setProperty('scroll-margin', prev, priority);
  else el.style.removeProperty('scroll-margin');

  return nextCaret;
};

// WebKit treats an element inside the layout viewport as already visible for
// block: 'nearest' and skips panning the visual viewport; fall back to center
// only after ancestor scrolling has also run and left the caret obscured.
const panVisualViewportCenter = (
  win: Window,
  scrollingElement: Element,
  el: Element,
  caret: ScrollRect,
  margin: number
) => {
  if (!canPanVisualViewport(win, scrollingElement, el)) return;

  const elRect = el.getBoundingClientRect();
  const prev = el.style.getPropertyValue('scroll-margin');
  const priority = el.style.getPropertyPriority('scroll-margin');

  setCaretScrollMargin(el, elRect, caret, margin, margin, margin, margin);
  el.scrollIntoView({ block: 'center', inline: 'nearest' });

  if (prev) el.style.setProperty('scroll-margin', prev, priority);
  else el.style.removeProperty('scroll-margin');
};

const getEnclosingFrame = (win: Window): Element | null => {
  try {
    return win.frameElement;
  } catch {
    return null;
  }
};

const mapRectIntoParentWindow = (
  rect: ScrollRect,
  frame: Element
): ScrollRect => {
  const frameRect = frame.getBoundingClientRect();
  const frameStyle = getElementStyle(frame);
  const scale = getElementScale(frame, frameRect);
  const offsetX =
    frameRect.left +
    (parsePositivePx(frameStyle?.borderLeftWidth) +
      parsePositivePx(frameStyle?.paddingLeft)) *
      scale.x;
  const offsetY =
    frameRect.top +
    (parsePositivePx(frameStyle?.borderTopWidth) +
      parsePositivePx(frameStyle?.paddingTop)) *
      scale.y;

  return {
    bottom: offsetY + rect.bottom * scale.y,
    left: offsetX + rect.left * scale.x,
    right: offsetX + rect.right * scale.x,
    top: offsetY + rect.top * scale.y,
  };
};

export const scrollRectIntoView = ({
  options,
  rect,
  scrollMarginTop,
  startElement,
}: {
  options?: ScrollIntoViewOptions;
  rect: ScrollRect;
  scrollMarginTop?: number;
  startElement: Element;
}) => {
  const normalized = normalizeOptions(options);
  const margin = normalized.defaultReveal ? MARGIN : 0;
  const cssMargins = readScrollMargins(startElement, scrollMarginTop);
  const margins = {
    bottom: Math.max(cssMargins.bottom, normalized.scrollMargin.bottom),
    left: Math.max(cssMargins.left, normalized.scrollMargin.left),
    right: Math.max(cssMargins.right, normalized.scrollMargin.right),
    top: Math.max(cssMargins.top, normalized.scrollMargin.top),
  };
  let cur: ScrollRect = {
    bottom: rect.bottom + margins.bottom,
    left: rect.left - margins.left,
    right: rect.right + margins.right,
    top: rect.top - margins.top,
  };
  let currentStart: Element = startElement;

  for (let depth = 0; depth < MAX_IFRAME_DEPTH; depth += 1) {
    const doc = currentStart.ownerDocument;
    const scrollingElement = doc.scrollingElement ?? doc.documentElement;

    if (!scrollingElement) return;

    const { cur: afterAncestors, stopped } = scrollAncestors(
      currentStart,
      scrollingElement,
      cur,
      null,
      normalized
    );

    cur = afterAncestors;
    if (stopped) return;

    const win = doc.defaultView;

    if (!win) return;

    const rootStyle = win.getComputedStyle(scrollingElement);
    const isRtl = rootStyle?.direction === 'rtl';
    let visible = getVisibleViewportBox(win, scrollingElement, margin);
    const dy =
      scrollingElement.scrollHeight > scrollingElement.clientHeight
        ? axisDelta({
            align: normalized.block,
            end: cur.bottom,
            high: visible.bottom,
            low: visible.top,
            scrollMode: normalized.scrollMode,
            start: cur.top,
          })
        : 0;
    const dx =
      scrollingElement.scrollWidth > scrollingElement.clientWidth
        ? axisDelta({
            align: normalized.inline,
            end: cur.right,
            high: visible.right,
            low: visible.left,
            rtl: isRtl,
            scrollMode: normalized.scrollMode,
            start: cur.left,
          })
        : 0;

    if (dy !== 0 || dx !== 0) {
      if (normalized.behavior === 'smooth') {
        win.scrollBy({ behavior: 'smooth', left: dx, top: dy });
        cur = shiftRect(cur, dx, dy);
      } else {
        const prevY = win.scrollY;
        const prevX = win.scrollX;

        win.scrollBy(dx, dy);
        cur = shiftRect(cur, win.scrollX - prevX, win.scrollY - prevY);
      }
      visible = getVisibleViewportBox(win, scrollingElement, margin);
    }

    if (normalized.behavior !== 'smooth') {
      if (outsideBox(cur, visible, 1)) {
        cur = panVisualViewportNearest(
          win,
          scrollingElement,
          currentStart,
          cur,
          margin
        );
        visible = getVisibleViewportBox(win, scrollingElement, margin);
      }

      if (outsideBox(cur, visible)) {
        ({ cur } = scrollAncestors(
          currentStart,
          scrollingElement,
          cur,
          visible,
          normalized
        ));
      }

      if (outsideBox(cur, visible, 1)) {
        panVisualViewportCenter(
          win,
          scrollingElement,
          currentStart,
          cur,
          margin
        );
      }
    }

    const frame = getEnclosingFrame(win);

    if (!frame || frame.ownerDocument === doc) return;
    if (
      normalized.boundary === frame ||
      (typeof normalized.boundary === 'function' && !normalized.boundary(frame))
    ) {
      return;
    }

    cur = mapRectIntoParentWindow(cur, frame);
    currentStart = frame;
  }
};

export const scrollRectIntoViewIfNeeded = ({
  rect,
  startElement,
}: {
  rect: ScrollRect;
  startElement: Element;
}) => {
  scrollRectIntoView({ rect, startElement });
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
