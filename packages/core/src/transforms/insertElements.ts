import { TEditor, Value } from '../slate/editor/TEditor';
import { EElement, TElement } from '../slate/element/TElement';
import {
  insertNodes,
  InsertNodesOptions,
} from '../slate/transforms/insertNodes';

export const insertElements = <V extends Value>(
  editor: TEditor<V>,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<V>
) => insertNodes(editor, nodes as EElement<V> | EElement<V>[], options);
