import { Editor, Transforms } from 'slate';
import { getQueryOptions } from '../queries/match';
import { InsertNodesOptions } from '../types/Transforms.types';

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
    } as any,
    getQueryOptions(editor, options)
  );
};
