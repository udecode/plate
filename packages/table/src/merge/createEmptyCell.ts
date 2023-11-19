import {
  getPluginType,
  PlateEditor,
  TDescendant,
  TElement,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_TH } from '../createTablePlugin';
import { TTableRowElement } from '../types';
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
