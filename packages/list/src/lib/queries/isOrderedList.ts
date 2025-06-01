import type { TElement } from '@udecode/plate';

import { ULIST_STYLE_TYPES } from '../types';

export function isOrderedList(element: TElement) {
  return (
    !!element.listStyleType &&
    !ULIST_STYLE_TYPES.includes(element.listStyleType as any)
  );
}
