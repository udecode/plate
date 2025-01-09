import { isOlSymbol } from '@udecode/plate';

import { getDocxListNode } from './getDocxListNode';

export const isDocxOl = (element: Element): boolean => {
  const listNode = getDocxListNode(element);

  if (!listNode) {
    return false;
  }

  return isOlSymbol(listNode.textContent || '');
};
