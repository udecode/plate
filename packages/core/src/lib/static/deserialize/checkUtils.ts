export const isElementStatic = (element: HTMLElement) => {
  return (
    'dataset' in element &&
    Object.hasOwn(element.dataset, 'slateNode') &&
    element.dataset.slateNode === 'element'
  );
};

export const isTextStatic = (element: HTMLElement) => {
  return (
    'dataset' in element &&
    Object.hasOwn(element.dataset, 'slateNode') &&
    element.dataset.slateNode === 'text'
  );
};

export const isLeafStatic = (element: HTMLElement) => {
  return (
    'dataset' in element &&
    Object.hasOwn(element.dataset, 'slateLeaf') &&
    element.dataset.slateLeaf === 'true'
  );
};

export const isStringStatic = (element: HTMLElement) => {
  return (
    'dataset' in element &&
    Object.hasOwn(element.dataset, 'slateString') &&
    element.dataset.slateString === 'true'
  );
};

export const isPluginStatic = (element: HTMLElement, key: string) => {
  return element.classList.contains(`slate-${key}`);
};

export const getSlateElements = (element: HTMLElement): HTMLElement[] => {
  return Array.from(element.querySelectorAll('[data-slate-node="element"]'));
};
