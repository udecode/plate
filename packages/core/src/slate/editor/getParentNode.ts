import { Editor, Location } from 'slate';
import { EAncestor } from '../node/TAncestor';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

export type GetParentOptions = Parameters<typeof Editor.parent>[2];

/**
 * Get the parent node of a location.
 * Returns undefined if there is no parent.
 */
export const getParentNode = <N extends EAncestor<V>, V extends Value = Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetParentOptions
): TNodeEntry<N> | undefined => {
  try {
    return Editor.parent(editor as any, at, options) as any;
  } catch (err) {}
};
