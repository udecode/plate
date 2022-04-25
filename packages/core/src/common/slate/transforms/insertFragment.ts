import { Transforms } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { ElementOf } from '../../../types/slate/TElement';
import { TextOf } from '../../../types/slate/TText';

/**
 * Insert a fragment at a specific location in the editor.
 */
export const insertFragment = <V extends Value>(
  editor: TEditor<V>,
  fragment: Array<ElementOf<TEditor<V>> | TextOf<TEditor<V>>>,
  options: Parameters<typeof Transforms.insertFragment>[2]
) => {
  Transforms.insertFragment(editor as any, fragment, options);
};
