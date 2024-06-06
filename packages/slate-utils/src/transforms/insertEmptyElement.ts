import {
  type InsertNodesOptions,
  type TEditor,
  type Value,
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
      children: [{ text: '' }],
      type,
    },
    getQueryOptions(editor, options)
  );
};
