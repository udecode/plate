import { getVoid } from 'slate';

import type { EditorVoidOptions, ElementOf } from '../../interfaces';
import type { Editor } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';

import { getAt } from '../../utils';

export const getVoidNode = <N extends ElementOf<E>, E extends Editor = Editor>(
  editor: E,
  options?: EditorVoidOptions
): NodeEntry<N> | undefined =>
  getVoid(editor as any, {
    ...options,
    at: getAt(editor, options?.at),
  }) as any;
