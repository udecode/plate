import { parent } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { EditorParentOptions } from '../../interfaces/index';
import type { AncestorOf } from '../../interfaces/node';
import type { NodeEntry } from '../../interfaces/node-entry';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const getParentNode = <
  N extends AncestorOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  at: At,
  options?: EditorParentOptions
): NodeEntry<N> | undefined => {
  try {
    return parent(editor as any, getAt(editor, at)!, options) as any;
  } catch {}
};
