import { getDocxListNode } from './getDocxListNode';
import { isOlSymbol } from './isOlSymbol';

export const isDocxOl = (element: Element): boolean => {
  const listNode = getDocxListNode(element);

  if (!listNode) {
    return false;
  }

  return isOlSymbol(listNode.textContent || '');
};
