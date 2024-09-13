import { type EditorParentOptions, type Location, Editor } from 'slate';

import type { AncestorOf } from '../node/TAncestor';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

/** Get the parent node of a location. Returns undefined if there is no parent. */
export const getParentNode = <
  N extends AncestorOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  at: Location,
  options?: EditorParentOptions
): TNodeEntry<N> | undefined => {
  try {
    return Editor.parent(editor as any, at, options) as any;
  } catch (error) {}
};
