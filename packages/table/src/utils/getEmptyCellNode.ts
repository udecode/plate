import type { TElement } from '@udecode/plate-common';

import { type PlateEditor, getPluginType } from '@udecode/plate-common';

import type { CellFactoryOptions } from '../types';

import { ELEMENT_TD, ELEMENT_TH } from '../TablePlugin';

export const getEmptyCellNode = (
  editor: PlateEditor,
  { children, header, row }: CellFactoryOptions = {}
) => {
  header =
    header ??
    (row
      ? (row as TElement).children.every(
          (c) => c.type === getPluginType(editor, ELEMENT_TH)
        )
      : false);

  return {
    children: children ?? [editor.blockFactory()],
    type: header
      ? getPluginType(editor, ELEMENT_TH)
      : getPluginType(editor, ELEMENT_TD),
  };
};
