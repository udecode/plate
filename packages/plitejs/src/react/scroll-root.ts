const SCROLLABLE_OVERFLOW_PATTERN = /(auto|scroll|overlay)/;

export const parseCSSPixels = (value: string | null | undefined) => {
  if (!value || value === 'auto' || value === 'none') return 0;

  const parsed = Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

export const canUseElementAsScrollRoot = (element: HTMLElement | null) => {
  if (!element) return false;

  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  const overflow = `${style?.overflow ?? ''} ${style?.overflowY ?? ''}`;
  const hasScrollableOverflow = SCROLLABLE_OVERFLOW_PATTERN.test(overflow);
  const hasBoundedHeight =
    element.clientHeight > 0 ||
    parseCSSPixels(style?.height) > 0 ||
    parseCSSPixels(style?.maxHeight) > 0;

  return hasScrollableOverflow && hasBoundedHeight;
};

export const findScrollableAncestor = (
  element: HTMLElement | null
): HTMLElement | null => {
  let current = element;

  while (current) {
    if (canUseElementAsScrollRoot(current)) return current;
    current = current.parentElement;
  }

  return null;
};
