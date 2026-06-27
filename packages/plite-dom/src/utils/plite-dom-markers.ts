import { type Element, type Text, TextApi } from '@platejs/plite';

const toKebabCase = (key: string) =>
  key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

/** Return true when the element is a Plite void element boundary. */
export const isVoid = (element: HTMLElement) =>
  element.dataset.pliteVoid === 'true';

/** Return true when the element is a Plite element node boundary. */
export const isElement = (element: HTMLElement) =>
  element.dataset.pliteNode === 'element';

/** Return true when the element is a Plite text node boundary. */
export const isText = (element: HTMLElement) =>
  element.dataset.pliteNode === 'text';

/** Return true when the element is a Plite rendered string boundary. */
export const isString = (element: HTMLElement) =>
  element.dataset.pliteString === 'true';

/** Return true when the element is a Plite leaf boundary. */
export const isLeaf = (element: HTMLElement) =>
  element.dataset.pliteLeaf === 'true';

/** Return true when the element is a Plite editable root. */
export const isEditor = (element: HTMLElement) =>
  element.dataset.pliteEditor === 'true';

/** Return true when the element is any Plite-owned DOM node boundary. */
export const isNode = (element: HTMLElement) =>
  isLeaf(element) ||
  isElement(element) ||
  isVoid(element) ||
  isString(element) ||
  isText(element);

/** Return Plite element boundaries below the provided element. */
export const getElements = (element: HTMLElement): HTMLElement[] =>
  Array.from(element.querySelectorAll('[data-plite-node="element"]'));

/** Convert a model property key to its Plite DOM data attribute name. */
export const keyToDataAttribute = (key: string) =>
  `data-plite-${toKebabCase(key)}`;

/** Return DOM data attribute names that mirror primitive node properties. */
export const getNodeDataAttributeKeys = (node: Element | Text) =>
  Object.keys(node)
    .filter(
      (key) =>
        typeof node[key] !== 'object' &&
        (!TextApi.isText(node) || key !== 'text')
    )
    .map((key) => keyToDataAttribute(key));
