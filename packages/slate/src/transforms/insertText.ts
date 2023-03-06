import { Transforms } from 'slate';
import { TextInsertTextOptions } from 'slate/dist/transforms/text';
import { TEditor, Value } from '../interfaces/editor/TEditor';

/**
 * Insert a string of text in the Editor.
 */
export const insertText = <V extends Value>(
  editor: TEditor<V>,
  text: string,
  options?: TextInsertTextOptions
) => {
  Transforms.insertText(editor as any, text, options);
};
