import { type EditorNodeOptions, type Location, Editor } from 'slate';

import type { NodeOf } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

/** Get the node at a location. */
export const getNodeEntry = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  at: Location,
  options?: EditorNodeOptions
): TNodeEntry<N> | undefined => {
  try {
    return Editor.node(editor as any, at, options) as any;
  } catch (error) {}
};
