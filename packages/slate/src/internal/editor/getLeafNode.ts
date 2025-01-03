import type { EditorLeafOptions } from 'slate/dist/interfaces/editor';

import { leaf } from 'slate';

import type { At } from '../../types';
import type { TextEntryOf } from '../../interfaces/node/TNodeEntry';
import type { TEditor } from '../../interfaces/editor/TEditor';

import { getAt } from '../../utils';

export const getLeafNode = <E extends TEditor>(
  editor: E,
  at: At,
  options?: EditorLeafOptions
): TextEntryOf<E> | undefined => {
  try {
    return leaf(editor as any, getAt(editor, at)!, options) as any;
  } catch {}
};
