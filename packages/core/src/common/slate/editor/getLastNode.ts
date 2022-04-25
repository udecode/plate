import { Editor, Location } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { NodeOf, TNodeEntry } from '../../../types/slate/TNode';

/**
 * Get the last node at a location.
 */
export const getLastNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): TNodeEntry<NodeOf<TEditor<V>>> => Editor.last(editor as any, at) as any;
