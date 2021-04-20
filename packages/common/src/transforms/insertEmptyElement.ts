import { TEditor, TElement } from '@udecode/slate-plugins-core';
import { getQueryOptions } from '../queries/match';
import { InsertNodesOptions } from '../types/Transforms.types';
import { insertNodes } from './insertNodes';

export const insertEmptyElement = (
  editor: TEditor,
  type: string,
  options?: InsertNodesOptions
) => {
  insertNodes<TElement>(
    editor,
    {
      type,
      children: [{ text: '' }],
    },
    getQueryOptions(editor, options)
  );
};
