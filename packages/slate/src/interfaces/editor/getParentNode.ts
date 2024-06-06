import { Editor, type EditorParentOptions, type Location } from 'slate';

import type { EAncestor } from '../node/TAncestor';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value } from './TEditor';

/** Get the parent node of a location. Returns undefined if there is no parent. */
export const getParentNode = <N extends EAncestor<V>, V extends Value = Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorParentOptions
): TNodeEntry<N> | undefined => {
  try {
    return Editor.parent(editor as any, at, options) as any;
  } catch (error) {}
};
