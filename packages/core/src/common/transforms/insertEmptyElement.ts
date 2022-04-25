import { TEditor } from '../../types/slate/TEditor';
import { TElement } from '../../types/slate/TElement';
import { getQueryOptions } from '../queries/match';
import {
  insertNodes,
  InsertNodesOptions,
} from '../slate/transforms/insertNodes';

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
