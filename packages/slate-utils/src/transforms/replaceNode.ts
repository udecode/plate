import {
  EElementOrText,
  insertNodes,
  removeNodes,
  TEditor,
  Value,
  withoutNormalizing,
} from '@udecode/slate';

import { ReplaceNodeChildrenOptions } from './replaceNodeChildren';

export const replaceNode = <
  N extends EElementOrText<V>,
  V extends Value = Value,
>(
  editor: TEditor<V>,
  { at, nodes, insertOptions, removeOptions }: ReplaceNodeChildrenOptions<N, V>
) => {
  withoutNormalizing(editor, () => {
    removeNodes(editor, { ...insertOptions, at });

    insertNodes(editor, nodes, {
      ...insertOptions,
      at,
    });
  });
};
