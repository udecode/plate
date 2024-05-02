import type { Path } from 'slate';

import {
  type EText,
  type PlateEditor,
  type Value,
  getNode,
  getNodeString,
  replaceNode,
  withoutNormalizing,
} from '@udecode/plate-common';

import type { TMentionInputElement } from '../types';

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
