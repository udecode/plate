import type { TextInsertTextOptions } from 'slate/dist/interfaces/transforms/text';

import { Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

/** Insert a string of text in the Editor. */
export const insertText = (
  editor: TEditor,
  text: string,
  options?: TextInsertTextOptions
) => {
  Transforms.insertText(editor as any, text, options);
};
