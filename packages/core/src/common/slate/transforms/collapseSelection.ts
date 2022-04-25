import { Transforms } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';

/**
 * Collapse the selection.
 */
export const collapseSelection = <V extends Value>(
  editor: TEditor<V>,
  options?: Parameters<typeof Transforms.collapse>[1]
) => {
  Transforms.collapse(editor as any, options);
};
