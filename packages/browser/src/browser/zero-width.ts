/** Rendered zero-width placeholder marker shape. */
export type PlaceholderShape = {
  hasBr: boolean;
  hasFEFF: boolean;
  kind: string | null;
};

/** Inspect the rendered shape of a Slate zero-width placeholder element. */
export const inspectZeroWidthPlaceholder = (
  element: Element | null
): PlaceholderShape => {
  if (!element) {
    return {
      hasBr: false,
      hasFEFF: false,
      kind: null,
    };
  }

  return {
    hasBr: !!element.querySelector('br'),
    hasFEFF: element.textContent?.includes('\uFEFF') ?? false,
    kind: element.getAttribute('data-slate-zero-width'),
  };
};
