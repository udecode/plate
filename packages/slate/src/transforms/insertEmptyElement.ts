import type { InsertNodesOptions, TEditor, ValueOf } from '../interfaces';

import { getQueryOptions } from '../utils';
import { insertElements } from './insertElements';

export const insertEmptyElement = <E extends TEditor>(
  editor: E,
  type: string,
  options?: InsertNodesOptions<ValueOf<E>>
) => {
  insertElements(
    editor,
    {
      children: [{ text: '' }],
      type,
    },
    getQueryOptions(editor, options)
  );
};
