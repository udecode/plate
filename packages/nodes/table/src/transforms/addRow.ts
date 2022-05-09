import {
  getAboveNode,
  getPluginType,
  insertElements,
  PlateEditor,
  someNode,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from '../utils/getEmptyRowNode';

export const addRow = <V extends Value>(
  editor: PlateEditor<V>,
  { header }: TablePluginOptions
) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentRowItem = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TR) },
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      insertElements(
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
