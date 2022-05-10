import { Transforms } from 'slate';
import { TEditor, Value } from '../editor/TEditor';
import { EDescendant } from '../node/TDescendant';

/**
 * Insert a fragment at a specific location in the editor.
 */
export const insertFragment = <
  N extends EDescendant<V>,
  V extends Value = Value
>(
  editor: TEditor<V>,
  fragment: N[],
  options?: Parameters<typeof Transforms.insertFragment>[2]
) => {
  Transforms.insertFragment(editor as any, fragment, options);
};
