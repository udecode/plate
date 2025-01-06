import type {
  Editor,
  ElementOrTextOf,
  InsertNodesOptions,
  RemoveNodesOptions,
  ValueOf,
} from '../interfaces';
import type { Path } from '../interfaces/path';

import { removeNodeChildren } from './removeNodeChildren';

export interface ReplaceNodeChildrenOptions<
  N extends ElementOrTextOf<E>,
  E extends Editor = Editor,
> {
  at: Path;
  nodes: N | N[];
  insertOptions?: Omit<InsertNodesOptions<ValueOf<E>>, 'at'>;
  removeOptions?: Omit<RemoveNodesOptions<ValueOf<E>>, 'at'>;
}

/** Replace node children: remove then insert. */
export const replaceNodeChildren = <
  N extends ElementOrTextOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  { at, insertOptions, nodes, removeOptions }: ReplaceNodeChildrenOptions<N, E>
) => {
  editor.tf.withoutNormalizing(() => {
    removeNodeChildren(editor, at, removeOptions);

    editor.tf.insertNodes(nodes, {
      ...insertOptions,
      at: at.concat([0]),
    });
  });
};
