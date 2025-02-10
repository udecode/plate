import { above as aboveBase } from 'slate';

import type { AncestorOf, EditorAboveOptions } from '../../interfaces';
import type { Editor, ValueOf } from '../../interfaces/editor/editor-type';
import type { NodeEntry } from '../../interfaces/node-entry';

import { getQueryOptions } from '../../utils/match';

export const above = <N extends AncestorOf<E>, E extends Editor = Editor>(
  editor: E,
  options?: EditorAboveOptions<ValueOf<E>>
): NodeEntry<N> | undefined => {
  try {
    return aboveBase(editor as any, getQueryOptions(editor, options)) as any;
  } catch {
    return undefined;
  }
};
