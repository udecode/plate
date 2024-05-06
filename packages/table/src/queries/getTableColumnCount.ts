import type { TElement } from '@udecode/plate-common/server';

export const getTableColumnCount = (tableNode: TElement) => {
  return (tableNode.children as TElement[])?.[0]?.children?.length ?? 0;
};
