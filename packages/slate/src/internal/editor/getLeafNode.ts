import type { EditorLeafOptions } from 'slate/dist/interfaces/editor';

import { leaf } from 'slate';

import type { TextOf } from '../../interfaces';
import type { TEditor } from '../../interfaces/editor/TEditor';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getLeafNode = <N extends TextOf<E>, E extends TEditor>(
  editor: E,
  at: At,
  options?: EditorLeafOptions
): TNodeEntry<N> | undefined => {
  try {
    return leaf(editor as any, getAt(editor, at)!, options) as any;
  } catch {}
};
