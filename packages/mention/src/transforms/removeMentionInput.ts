import {
  EText,
  getNode,
  getNodeString,
  PlateEditor,
  replaceNode,
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

    const text = getNodeString(node);

    replaceNode(editor, {
      at: path,
      nodes: { text: `${trigger}${text}` } as EText<V>,
    });
  });
