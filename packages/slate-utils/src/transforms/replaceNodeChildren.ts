import type { Path } from 'slate';

import {
  type ElementOrTextOf,
  type InsertNodesOptions,
  type RemoveNodesOptions,
  type TEditor,
  insertNodes,
  withoutNormalizing,
} from '@udecode/slate';

import { removeNodeChildren } from './removeNodeChildren';

export interface ReplaceNodeChildrenOptions<
  N extends ElementOrTextOf<E>,
  E extends TEditor = TEditor,
> {
  at: Path;
  nodes: N | N[];
  insertOptions?: Omit<InsertNodesOptions<E>, 'at'>;
  removeOptions?: Omit<RemoveNodesOptions<E>, 'at'>;
}

/** Replace node children: remove then insert. */
export const replaceNodeChildren = <
  N extends ElementOrTextOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  { at, insertOptions, nodes, removeOptions }: ReplaceNodeChildrenOptions<N, E>
) => {
  withoutNormalizing(editor, () => {
    removeNodeChildren(editor, at, removeOptions);

    insertNodes(editor, nodes, {
      ...insertOptions,
      at: at.concat([0]),
    });
  });
};
