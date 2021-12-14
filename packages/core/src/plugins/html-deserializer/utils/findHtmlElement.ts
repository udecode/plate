import { traverseHtmlElements } from './traverseHtmlElements';

/**
 * Find the first HTML element that matches the given selector.
 * @param rootNode
 * @param predicate
 */
export const findHtmlElement = (
  rootNode: Node,
  predicate: (node: HTMLElement) => boolean
) => {
  let res: Node | null = null;

  traverseHtmlElements(rootNode, (node) => {
    if (predicate(node as HTMLElement)) {
      res = node;
      return false;
    }
    return true;
  });

  return res;
};

export const someHtmlElement = (
  rootNode: Node,
  predicate: (node: HTMLElement) => boolean
) => {
  return !!findHtmlElement(rootNode, predicate);
};
