import type { TElement } from '@udecode/plate';

export const getTableColumnCount = (tableNode: TElement): number => {
  if ((tableNode.children as TElement[])?.[0]?.children) {
    return (tableNode.children as TElement[])[0].children
      .map(
        (element) =>
          element.colSpan || (element?.attributes as any)?.colspan || 1
      )
      .reduce((total: number, num: number) => Number(total) + Number(num));
  }

  return 0;
};
