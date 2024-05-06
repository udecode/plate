import type { TextInsertTextOptions } from 'slate/dist/interfaces/transforms/text';

import { Transforms } from 'slate';

import type { TEditor, Value } from '../editor/TEditor';

/** Insert a string of text in the Editor. */
export const insertText = <V extends Value>(
  editor: TEditor<V>,
  text: string,
  options?: TextInsertTextOptions
) => {
  Transforms.insertText(editor as any, text, options);
};
