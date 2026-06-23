import type { Element } from '@platejs/slate';
import type { TTableCellElement } from 'platejs';

export const getTableColumnCount = (tableNode: Element): number => {
  if ((tableNode.children as Element[])?.[0]?.children) {
    return (
      (tableNode.children as Element[])[0].children as TTableCellElement[]
    )
      .map((element) =>
        Number(element.colSpan || element.attributes?.colspan || 1)
      )
      .reduce((total: number, num: number) => Number(total) + Number(num));
  }

  return 0;
};
