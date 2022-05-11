import { Transforms } from 'slate';
import { TEditor, Value } from '../editor/TEditor';

/**
 * Delete content in the editor.
 */
export const deleteText = <V extends Value>(
  editor: TEditor<V>,
  options?: Parameters<typeof Transforms.delete>[1]
) => {
  Transforms.delete(editor as any, options);
};
