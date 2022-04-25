import { Editor, Location } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { NodeOf, TNodeEntry } from '../../../types/slate/TNode';

export type GetNodeEntryOptions = Parameters<typeof Editor.node>[2];

/**
 * Get the node at a location.
 */
export const getNodeEntry = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetNodeEntryOptions
): TNodeEntry<NodeOf<TEditor<V>>> =>
  Editor.node(editor as any, at, options) as any;
