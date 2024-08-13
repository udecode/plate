import {
  type ElementOrTextOf,
  type TEditor,
  insertNodes,
  removeNodes,
  withoutNormalizing,
} from '@udecode/slate';

import type { ReplaceNodeChildrenOptions } from './replaceNodeChildren';

export const replaceNode = <
  N extends ElementOrTextOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  { at, insertOptions, nodes, removeOptions }: ReplaceNodeChildrenOptions<N, E>
) => {
  withoutNormalizing(editor, () => {
    removeNodes(editor, { ...removeOptions, at });

    insertNodes(editor, nodes, {
      ...insertOptions,
      at,
    });
  });
};
