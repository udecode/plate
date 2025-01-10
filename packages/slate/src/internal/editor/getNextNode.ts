import { next } from 'slate';

import type { DescendantOf, EditorNextOptions } from '../../interfaces';
import type { Editor, ValueOf } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';

import { getQueryOptions } from '../../utils';

export const getNextNode = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: EditorNextOptions<ValueOf<E>>
): NodeEntry<N> | undefined => {
  return next(editor as any, getQueryOptions(editor, options)) as any;
};
