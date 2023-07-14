import {
  getNode,
  insertText,
  PlateEditor,
  unwrapNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { TMentionInputElement } from '../types';

export const removeMentionInput = <V extends Value>(
  editor: PlateEditor<V>,
  path: Path
) =>
  withoutNormalizing(editor, () => {
    const node = getNode<TMentionInputElement>(editor, path);
    if (!node) return;

    const { trigger } = node;

    insertText(editor, trigger, {
      at: { path: [...path, 0], offset: 0 },
    });
    unwrapNodes(editor, {
      at: path,
    });
  });
