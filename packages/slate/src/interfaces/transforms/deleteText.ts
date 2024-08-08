import type { TextDeleteOptions } from 'slate/dist/interfaces/transforms/text';

import { Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

/** Delete content in the editor. */
export const deleteText = (editor: TEditor, options?: TextDeleteOptions) => {
  Transforms.delete(editor as any, options);
};
