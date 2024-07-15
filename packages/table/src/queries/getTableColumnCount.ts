import type { TElement } from '@udecode/plate-common';

export const getTableColumnCount = (tableNode: TElement) => {
  if ((tableNode.children as TElement[])?.[0]) {
    return (tableNode.children as TElement[])[0].children
      .map(
        (element) =>
          element.colSpan || (element?.attributes as any)?.colspan || 1
      )
      .reduce((total: number, num: number) => total + num);
  }

  return 0;
};
