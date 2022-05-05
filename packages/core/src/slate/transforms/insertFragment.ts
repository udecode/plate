import { Transforms } from 'slate';
import { EDescendant } from '../types/TDescendant';
import { TEditor, Value } from '../types/TEditor';

/**
 * Insert a fragment at a specific location in the editor.
 */
export const insertFragment = <V extends Value>(
  editor: TEditor<V>,
  fragment: EDescendant<V>[],
  options?: Parameters<typeof Transforms.insertFragment>[2]
) => {
  Transforms.insertFragment(editor as any, fragment, options);
};
