import { Editor, Location } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { TNodeEntry } from '../../../types/slate/TNode';
import { TextOf } from '../../../types/slate/TText';

/**
 * Get the leaf text node at a location.
 */
export const getLeafNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: Parameters<typeof Editor.leaf>[2]
): TNodeEntry<TextOf<TEditor<V>>> =>
  Editor.leaf(editor as any, at, options) as any;
