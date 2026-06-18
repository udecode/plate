import { parent as parentBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { EditorParentOptions } from '../../interfaces/index';
import type { AncestorOf } from '../../interfaces/node';
import type { NodeEntry } from '../../interfaces/node-entry';
import type { At } from '../../types';

import { getAt } from '../../utils';

export const parent = <N extends AncestorOf<E>, E extends Editor = Editor>(
  editor: E,
  at: At,
  options?: EditorParentOptions
): NodeEntry<N> | undefined => {
  try {
    return parentBase(editor as any, getAt(editor, at)!, options) as any;
  } catch {}
};
