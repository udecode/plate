import type { Path } from 'slate';

import { type SlateEditor, isText } from '@udecode/plate-common';

export const removeAINodes = (
  editor: SlateEditor,
  { at = [] }: { at?: Path } = {}
) => {
  editor.tf.removeNodes({
    at,
    match: (n) => isText(n) && !!(n as any).ai,
  });
};
