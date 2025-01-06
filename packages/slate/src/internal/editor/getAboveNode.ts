import { above } from 'slate';

import type { AncestorOf, EditorAboveOptions } from '../../interfaces';
import type { Editor, ValueOf } from '../../interfaces/editor/editor';
import type { NodeEntry } from '../../interfaces/node-entry';

import { getQueryOptions } from '../../utils/match';

export const getAboveNode = <
  N extends AncestorOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: EditorAboveOptions<ValueOf<E>>
): NodeEntry<N> | undefined => {
  try {
    return above(editor as any, getQueryOptions(editor, options)) as any;
  } catch (error) {
    return undefined;
  }
};
