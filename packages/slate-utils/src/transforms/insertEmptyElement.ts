import { getQueryOptions } from '../queries/match';
import { TEditor, Value } from '../slate/editor/TEditor';
import { InsertNodesOptions } from '../slate/transforms/insertNodes';
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
