import { getAbove, insertNodes, someNode } from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlateEditor,
  TElement,
  TPlateEditor,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TR } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from '../utils/getEmptyRowNode';

export const addRow = (editor: PlateEditor, { header }: TablePluginOptions) => {
  if (
    someNode(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentRowItem = getAbove(editor, {
      match: { type: getPlatePluginType(editor, ELEMENT_TR) },
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      insertNodes<TElement>(
        editor,
        getEmptyRowNode(editor, {
          header,
          colCount: currentRowElem.children.length,
        }),
        {
          at: Path.next(currentRowPath),
          select: true,
        }
      );
    }
  }
};
