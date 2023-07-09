import { Editor, EditorNodeOptions, Location } from 'slate';

import { ENode } from '../node/TNode';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

/**
 * Get the node at a location.
 */
export const getNodeEntry = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorNodeOptions
): TNodeEntry<N> | undefined => {
  try {
    return Editor.node(editor as any, at, options) as any;
  } catch (error) {}
};
