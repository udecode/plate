import {
  insertNodes,
  InsertNodesOptions,
} from '../../slate/transforms/insertNodes';
import { TEditor, Value } from '../../slate/editor/TEditor';
import { TElement } from '../../slate/element/TElement';

export const insertElements = <V extends Value>(
  editor: TEditor<V>,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<V>
) => insertNodes(editor, nodes, options);
