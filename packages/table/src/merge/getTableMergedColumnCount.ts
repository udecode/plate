import { TElement } from '@udecode/plate-common/server';

import { getColSpan } from '../queries';

export const getTableMergedColumnCount = (tableNode: TElement) => {
  return (tableNode.children as TElement[])?.[0]?.children?.reduce(
    // @ts-ignore
    (prev, cur) => prev + (getColSpan(cur) ?? 1),
    0
  );
};
