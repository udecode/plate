import type { TElement } from 'platejs';

import { getColSpan } from '../queries';

export const getTableMergedColumnCount = (tableNode: TElement) =>
  (tableNode.children as TElement[])?.[0]?.children?.reduce(
    (prev, cur) => prev + (getColSpan(cur as any) ?? 1),
    0
  );
