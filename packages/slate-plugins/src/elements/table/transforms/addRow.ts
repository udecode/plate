import { getAbove, someNode } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor, Path, Transforms } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TR } from '../defaults';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from '../utils/getEmptyRowNode';

export const addRow = (editor: Editor, { header }: TablePluginOptions) => {
  if (
    someNode(editor, { match: { type: getPluginType(editor, ELEMENT_TABLE) } })
  ) {
    const currentRowItem = getAbove(editor, {
      match: { type: getPluginType(editor, ELEMENT_TR) },
    });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      Transforms.insertNodes(
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
