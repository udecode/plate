import type { Path } from 'slate';

import { type SlateEditor, isText, removeNodes } from '@udecode/plate-common';

export const removeAINodes = (
  editor: SlateEditor,
  { at = [] }: { at?: Path } = {}
) => {
  removeNodes(editor, {
    at,
    match: (n) => isText(n) && !!(n as any).ai,
  });
};
