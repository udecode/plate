export const isPliteVoid = (element: HTMLElement) =>
  element.dataset.pliteVoid === 'true';

export const isPliteElement = (element: HTMLElement) =>
  element.dataset.pliteNode === 'element';

export const isPliteText = (element: HTMLElement) =>
  element.dataset.pliteNode === 'text';

export const isPliteString = (element: HTMLElement) =>
  element.dataset.pliteString === 'true';

export const isPliteLeaf = (element: HTMLElement) =>
  element.dataset.pliteLeaf === 'true';

export const isBasePlateEditor = (element: HTMLElement) =>
  element.dataset.pliteEditor === 'true';

export const isPliteNode = (element: HTMLElement) =>
  isPliteLeaf(element) ||
  isPliteElement(element) ||
  isPliteVoid(element) ||
  isPliteString(element) ||
  isPliteText(element);

export const isPlitePluginElement = (element: HTMLElement, pluginKey: string) =>
  element.dataset.pliteNode === 'element' &&
  element.classList.contains(`plite-${pluginKey}`);

export const isPlitePluginNode = (element: HTMLElement, pluginKey: string) =>
  element.classList.contains(`plite-${pluginKey}`);

export const getPliteElements = (element: HTMLElement): HTMLElement[] =>
  Array.from(element.querySelectorAll('[data-plite-node="element"]'));
