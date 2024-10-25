import type { Location } from 'slate';

import { type SlateEditor, unsetNodes } from '@udecode/plate-common';

export const removeAIMarks = (
  editor: SlateEditor,
  { at = [] }: { at?: Location } = {}
) => {
  unsetNodes(editor, 'ai', {
    at,
    match: (n) => (n as any).ai,
  });
};
