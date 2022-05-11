import { Transforms } from 'slate';
import { TEditor, Value } from '../editor/TEditor';

/**
 * Insert a string of text in the Editor.
 */
export const insertText = <V extends Value>(
  editor: TEditor<V>,
  text: string,
  options?: Parameters<typeof Transforms.insertText>[2]
) => {
  Transforms.insertText(editor as any, text, options);
};
