import { normalizeNode as normalizeNodeBase } from 'slate';

import type { Editor, NodeEntry, Operation } from '../../interfaces';

export const normalizeNode = (
  editor: Editor,
  entry: NodeEntry,
  options?: { operation?: Operation }
) => {
  const value = editor.meta.isNormalizing;

  editor.meta.isNormalizing = true;

  normalizeNodeBase(editor as any, entry, options);

  editor.meta.isNormalizing = value;
};
