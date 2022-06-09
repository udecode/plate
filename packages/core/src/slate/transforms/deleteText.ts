import { Transforms } from 'slate';
import { TextDeleteOptions } from 'slate/dist/transforms/text';
import { TEditor, Value } from '../editor/TEditor';

/**
 * Delete content in the editor.
 */
export const deleteText = <V extends Value>(
  editor: TEditor<V>,
  options?: TextDeleteOptions
) => {
  Transforms.delete(editor as any, options);
};
