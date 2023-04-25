import {
  EElement,
  insertNodes,
  InsertNodesOptions,
  TEditor,
  TElement,
  Value,
} from '@udecode/slate';

export const insertElements = <V extends Value>(
  editor: TEditor<V>,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<V>
) => insertNodes(editor, nodes as EElement<V> | EElement<V>[], options);
