import { Editor, Transforms } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../elements/paragraph/defaults';
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
      type: ELEMENT_PARAGRAPH,
      children: [{ text: '' }],
    },
    getQueryOptions(editor, options)
  );
};
