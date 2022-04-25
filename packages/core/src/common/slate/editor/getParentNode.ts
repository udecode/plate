import { Editor, Location } from 'slate';
import { AncestorOf } from '../../../types/slate/TAncestor';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { TNodeEntry } from '../../../types/slate/TNode';

export type GetParentOptions = Parameters<typeof Editor.parent>[2];

/**
 * Get the parent node of a location.
 * Returns undefined if there is no parent.
 */
export const getParentNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetParentOptions
): TNodeEntry<AncestorOf<TEditor<V>>> | undefined => {
  try {
    return Editor.parent(editor as any, at, options) as any;
  } catch (err) {}
};
