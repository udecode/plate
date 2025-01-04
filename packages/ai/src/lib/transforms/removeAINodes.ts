import type { Path } from 'slate';

import { type SlateEditor, TextApi } from '@udecode/plate-common';

export const removeAINodes = (
  editor: SlateEditor,
  { at = [] }: { at?: Path } = {}
) => {
  editor.tf.removeNodes({
    at,
    match: (n) => TextApi.isText(n) && !!(n as any).ai,
  });
};
