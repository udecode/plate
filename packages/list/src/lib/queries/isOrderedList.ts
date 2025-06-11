import type { TElement } from 'platejs';

import { ULIST_STYLE_TYPES } from '../types';

export function isOrderedList(element: TElement) {
  return (
    !!element.listStyleType &&
    !ULIST_STYLE_TYPES.includes(element.listStyleType as any)
  );
}
