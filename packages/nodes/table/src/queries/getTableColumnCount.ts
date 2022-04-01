import { TElement } from '@udecode/plate-core';

export const getTableColumnCount = (tableNode: TElement) => {
  return tableNode.children[0]?.children?.length ?? 0;
};
