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

import { TSlashInputElement } from '../types';

export const removeSlashInput = <V extends Value>(
  editor: PlateEditor<V>,
  path: Path
) =>
  withoutNormalizing(editor, () => {
    const node = getNode<TSlashInputElement>(editor, path);
    if (!node) return;

    const { trigger } = node;

    const text = getNodeString(node);

    replaceNode(editor, {
      at: path,
      nodes: { text: `${trigger}${text}` } as EText<V>,
    });
  });
