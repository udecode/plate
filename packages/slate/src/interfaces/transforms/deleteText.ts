import type { TextDeleteOptions } from 'slate/dist/interfaces/transforms/text';

import { Transforms } from 'slate';

import type { TEditor, Value } from '../editor/TEditor';

/** Delete content in the editor. */
export const deleteText = <V extends Value>(
  editor: TEditor<V>,
  options?: TextDeleteOptions
) => {
  Transforms.delete(editor as any, options);
};
