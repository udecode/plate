import { node } from 'slate';

import type { DescendantOf, EditorNodeOptions } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor';
import type { NodeEntry } from '../../interfaces/node-entry';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getNodeEntry = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  at: At,
  options?: EditorNodeOptions
): NodeEntry<N> | undefined => {
  try {
    return node(editor as any, getAt(editor, at)!, options) as any;
  } catch {}
};
