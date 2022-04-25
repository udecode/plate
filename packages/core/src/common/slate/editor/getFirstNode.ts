import { Editor, Location } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { NodeOf, TNodeEntry } from '../../../types/slate/TNode';

/**
 * Get the first node at a location.
 */
export const getFirstNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): TNodeEntry<NodeOf<TEditor<V>>> => Editor.first(editor as any, at) as any;
