import { Transforms } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { EElement } from '../types/TElement';
import { EText } from '../types/TText';

/**
 * Insert a fragment at a specific location in the editor.
 */
export const insertFragment = <V extends Value>(
  editor: TEditor<V>,
  fragment: Array<EElement<V> | EText<V>>,
  options?: Parameters<typeof Transforms.insertFragment>[2]
) => {
  Transforms.insertFragment(editor as any, fragment, options);
};
