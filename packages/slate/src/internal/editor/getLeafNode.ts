import type { EditorLeafOptions } from 'slate/dist/interfaces/editor';

import { leaf } from 'slate';

import type { TextOf } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getLeafNode = <N extends TextOf<E>, E extends Editor>(
  editor: E,
  at: At,
  options?: EditorLeafOptions
): NodeEntry<N> | undefined => {
  try {
    return leaf(editor as any, getAt(editor, at)!, options) as any;
  } catch {}
};
