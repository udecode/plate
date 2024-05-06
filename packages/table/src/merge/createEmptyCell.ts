import {
  type PlateEditor,
  type TDescendant,
  type TElement,
  type Value,
  getPluginType,
} from '@udecode/plate-common/server';

import type { TTableRowElement } from '../types';

import { ELEMENT_TH } from '../createTablePlugin';
import { getEmptyCellNode } from '../utils';

export const createEmptyCell = <V extends Value>(
  editor: PlateEditor<V>,
  row: TTableRowElement,
  newCellChildren?: TDescendant[],
  header?: boolean
) => {
  const isHeaderRow =
    header === undefined
      ? (row as TElement).children.every(
          (c) => c.type === getPluginType(editor, ELEMENT_TH)
        )
      : header;

  return getEmptyCellNode(editor, {
    header: isHeaderRow,
    newCellChildren,
  });
};
