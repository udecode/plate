export const isSlateVoid = (element: HTMLElement) =>
  element.dataset.slateVoid === 'true';

export const isSlateElement = (element: HTMLElement) =>
  element.dataset.slateNode === 'element';

export const isSlateText = (element: HTMLElement) =>
  element.dataset.slateNode === 'text';

export const isSlateString = (element: HTMLElement) =>
  element.dataset.slateString === 'true';

export const isSlateLeaf = (element: HTMLElement) =>
  element.dataset.slateLeaf === 'true';

export const isSlateEditor = (element: HTMLElement) =>
  element.dataset.slateEditor === 'true';

export const isSlateNode = (element: HTMLElement) =>
  isSlateLeaf(element) ||
  isSlateElement(element) ||
  isSlateVoid(element) ||
  isSlateString(element) ||
  isSlateText(element);

export const isSlatePluginElement = (element: HTMLElement, pluginKey: string) =>
  element.dataset.slateNode === 'element' &&
  element.classList.contains(`slate-${pluginKey}`);

export const isSlatePluginNode = (element: HTMLElement, pluginKey: string) =>
  element.classList.contains(`slate-${pluginKey}`);

export const getSlateElements = (element: HTMLElement): HTMLElement[] =>
  Array.from(element.querySelectorAll('[data-slate-node="element"]'));
