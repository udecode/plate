import { getAbove, someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Path, Transforms } from 'slate';
import { TablePluginOptions } from '../types';
import { getEmptyRowNode } from '../utils/getEmptyRowNode';

export const addRow = (
  editor: Editor,
  { header }: TablePluginOptions,
  options: SlatePluginsOptions
) => {
  const { table, tr } = options;

  if (someNode(editor, { match: { type: table.type } })) {
    const currentRowItem = getAbove(editor, { match: { type: tr.type } });
    if (currentRowItem) {
      const [currentRowElem, currentRowPath] = currentRowItem;
      Transforms.insertNodes(
        editor,
        getEmptyRowNode(
          { header, colCount: currentRowElem.children.length },
          options
        ),
        {
          at: Path.next(currentRowPath),
          select: true,
        }
      );
    }
  }
};
