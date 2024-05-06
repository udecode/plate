import { Editor, type EditorNodeOptions, type Location } from 'slate';

import type { ENode } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value } from './TEditor';

/** Get the node at a location. */
export const getNodeEntry = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorNodeOptions
): TNodeEntry<N> | undefined => {
  try {
    return Editor.node(editor as any, at, options) as any;
  } catch (error) {}
};
