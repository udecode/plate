import {
  insertNodes,
  InsertNodesOptions,
} from '../../slate/transforms/insertNodes';
import { TEditor, Value } from '../../slate/types/TEditor';
import { EElement } from '../../slate/types/TElement';
import { getQueryOptions } from '../queries/match';

export const insertEmptyElement = <V extends Value>(
  editor: TEditor<V>,
  type: string,
  options?: InsertNodesOptions<V>
) => {
  insertNodes(
    editor,
    {
      type,
      children: [{ text: '' }],
    } as EElement<V>,
    getQueryOptions(editor, options)
  );
};
