import { TElement } from '@udecode/plate-common';

export const getTableMergedColumnCount = (tableNode: TElement) => {
  return (tableNode.children as TElement[])?.[0]?.children?.reduce(
    // @ts-ignore
    (prev, cur) => prev + (cur.colSpan ?? 1),
    0
  );
};
