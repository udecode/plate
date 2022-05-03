import { Editor, Location } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { ETextEntry } from '../types/TNodeEntry';

/**
 * Get the leaf text node at a location.
 */
export const getLeafNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: Parameters<typeof Editor.leaf>[2]
): ETextEntry<V> => Editor.leaf(editor as any, at, options) as any;
