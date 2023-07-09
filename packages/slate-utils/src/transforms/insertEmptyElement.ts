import {
  InsertNodesOptions,
  TEditor,
  Value,
  getQueryOptions,
} from '@udecode/slate';

import { insertElements } from './insertElements';

export const insertEmptyElement = <V extends Value>(
  editor: TEditor<V>,
  type: string,
  options?: InsertNodesOptions<V>
) => {
  insertElements(
    editor,
    {
      type,
      children: [{ text: '' }],
    },
    getQueryOptions(editor, options)
  );
};
