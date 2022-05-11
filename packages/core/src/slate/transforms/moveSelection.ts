import { Transforms } from 'slate';
import { TEditor, Value } from '../editor/TEditor';

/**
 * Move the selection's point forward or backward.
 */
export const moveSelection = <V extends Value>(
  editor: TEditor<V>,
  options?: Parameters<typeof Transforms.move>[1]
) => {
  Transforms.move(editor as any, options);
};
