import { Editor, Location } from 'slate';
import { ENode } from '../node/TNode';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

export type GetNodeEntryOptions = Parameters<typeof Editor.node>[2];

/**
 * Get the node at a location.
 */
export const getNodeEntry = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetNodeEntryOptions
): TNodeEntry<N> => Editor.node(editor as any, at, options) as any;
