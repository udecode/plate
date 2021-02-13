import { Editor, Transforms } from 'slate';
import { InsertNodesOptions } from '../types/Transforms.types';
import { getQueryOptions } from '../utils/match';

export const insertEmptyElement = (
  editor: Editor,
  type: string,
  options?: InsertNodesOptions
) => {
  Transforms.insertNodes(
    editor,
    {
      type,
      children: [{ text: '' }],
    },
    getQueryOptions(editor, options)
  );
};
