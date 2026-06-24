import type { Element } from '@platejs/plite';
import type { TTableCellElement } from 'platejs';

import { getColSpan } from '../queries';

export const getTableMergedColumnCount = (tableNode: Element) =>
  (
    (tableNode.children as Element[])?.[0]?.children as
      | TTableCellElement[]
      | undefined
  )?.reduce((prev, cur) => prev + (getColSpan(cur) ?? 1), 0) ?? 0;
