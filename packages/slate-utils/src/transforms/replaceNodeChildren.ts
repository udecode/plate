import { Path } from 'slate';
import {
  EElementOrText,
  insertNodes,
  InsertNodesOptions,
  RemoveNodesOptions,
  TEditor,
  Value,
  withoutNormalizing,
} from '../slate';
import { removeNodeChildren } from './removeNodeChildren';

export interface ReplaceNodeChildrenOptions<
  N extends EElementOrText<V>,
  V extends Value = Value
> {
  at: Path;
  nodes: N | N[];
  removeOptions?: Omit<RemoveNodesOptions<V>, 'at'>;
  insertOptions?: Omit<InsertNodesOptions<V>, 'at'>;
}

/**
 * Replace node children: remove then insert.
 */
export const replaceNodeChildren = <
  N extends EElementOrText<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  { at, nodes, insertOptions, removeOptions }: ReplaceNodeChildrenOptions<N, V>
) => {
  withoutNormalizing(editor, () => {
    removeNodeChildren(editor, at, removeOptions);

    insertNodes(editor, nodes, {
      ...insertOptions,
      at: at.concat([0]),
    });
  });
};
