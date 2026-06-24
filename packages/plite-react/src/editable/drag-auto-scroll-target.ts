const DRAG_AUTOSCROLL_EDGE_SIZE = 48;
const DRAG_AUTOSCROLL_MAX_DELTA = 28;
const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;

const clampDragAutoScrollCoordinate = (
  value: number,
  min: number,
  max: number
) => Math.min(Math.max(value, min), Math.max(min, max - 1));

const getComposedParentElement = (element: HTMLElement) => {
  if (element.parentElement) {
    return element.parentElement;
  }

  const window = element.ownerDocument.defaultView;

  if (!window) {
    return null;
  }

  const ShadowRootConstructor = window.ShadowRoot;
  const root = element.getRootNode();

  if (ShadowRootConstructor && root instanceof ShadowRootConstructor) {
    const { host } = root;

    return host instanceof window.HTMLElement ? host : null;
  }

  return null;
};

export const canScrollY = (element: HTMLElement) => {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const overflowY = style?.overflowY ?? '';

  return (
    SCROLLABLE_OVERFLOW_PATTERN.test(overflowY) &&
    element.scrollHeight > element.clientHeight
  );
};

const getDragAutoScrollDelta = ({
  clientY,
  rect,
}: {
  clientY: number;
  rect: Pick<DOMRect, 'bottom' | 'top'>;
}) => {
  const topDistance = clientY - rect.top;
  const bottomDistance = rect.bottom - clientY;

  if (
    topDistance < DRAG_AUTOSCROLL_EDGE_SIZE &&
    topDistance >= -DRAG_AUTOSCROLL_EDGE_SIZE
  ) {
    const intensity = 1 - Math.max(0, topDistance) / DRAG_AUTOSCROLL_EDGE_SIZE;

    return -Math.max(1, Math.ceil(intensity * DRAG_AUTOSCROLL_MAX_DELTA));
  }

  if (
    bottomDistance < DRAG_AUTOSCROLL_EDGE_SIZE &&
    bottomDistance >= -DRAG_AUTOSCROLL_EDGE_SIZE
  ) {
    const intensity =
      1 - Math.max(0, bottomDistance) / DRAG_AUTOSCROLL_EDGE_SIZE;

    return Math.max(1, Math.ceil(intensity * DRAG_AUTOSCROLL_MAX_DELTA));
  }

  return 0;
};

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
  scroll: () => boolean;
} => {
  for (
    let parent: HTMLElement | null = rootElement;
    parent;
    parent = getComposedParentElement(parent)
  ) {
    if (!canScrollY(parent)) {
      continue;
    }

    const rect = parent.getBoundingClientRect();

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top - DRAG_AUTOSCROLL_EDGE_SIZE ||
      clientY > rect.bottom + DRAG_AUTOSCROLL_EDGE_SIZE
    ) {
      continue;
    }

    const delta = getDragAutoScrollDelta({ clientY, rect });

    if (delta === 0) {
      continue;
    }

    const maxScrollTop = parent.scrollHeight - parent.clientHeight;
    const canMove =
      delta < 0 ? parent.scrollTop > 0 : parent.scrollTop < maxScrollTop;

    if (!canMove) {
      continue;
    }

    return {
      clientX: clampDragAutoScrollCoordinate(clientX, rect.left, rect.right),
      clientY: clampDragAutoScrollCoordinate(clientY, rect.top, rect.bottom),
      delta,
      scroll: () => {
        const previousScrollTop = parent.scrollTop;

        parent.scrollTop += delta;

        return parent.scrollTop !== previousScrollTop;
      },
    };
  }

  const window = rootElement.ownerDocument.defaultView;
  const scrollingElement = rootElement.ownerDocument.scrollingElement;

  if (!window || !scrollingElement) {
    return null;
  }

  if (
    clientX < 0 ||
    clientX > window.innerWidth ||
    clientY < -DRAG_AUTOSCROLL_EDGE_SIZE ||
    clientY > window.innerHeight + DRAG_AUTOSCROLL_EDGE_SIZE ||
    scrollingElement.scrollHeight <= scrollingElement.clientHeight
  ) {
    return null;
  }

  const delta = getDragAutoScrollDelta({
    clientY,
    rect: { bottom: window.innerHeight, top: 0 },
  });

  if (delta === 0) {
    return null;
  }

  const maxScrollTop =
    scrollingElement.scrollHeight - scrollingElement.clientHeight;
  const canMove =
    delta < 0
      ? scrollingElement.scrollTop > 0
      : scrollingElement.scrollTop < maxScrollTop;

  if (!canMove) {
    return null;
  }

  return {
    clientX: clampDragAutoScrollCoordinate(clientX, 0, window.innerWidth),
    clientY: clampDragAutoScrollCoordinate(clientY, 0, window.innerHeight),
    delta,
    scroll: () => {
      const previousScrollTop = scrollingElement.scrollTop;

      window.scrollBy(0, delta);

      return scrollingElement.scrollTop !== previousScrollTop;
    },
  };
};
