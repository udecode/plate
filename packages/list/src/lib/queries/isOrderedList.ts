import type { Element } from '@platejs/plite';

import { ULIST_STYLE_TYPES } from '../types';

export function isOrderedList(element: Element) {
  return (
    !!element.listStyleType &&
    !ULIST_STYLE_TYPES.includes(element.listStyleType as any)
  );
}
