import type { SlateEditor } from '@udecode/plate-common';
import type { Location } from 'slate';

export const removeAIMarks = (
  editor: SlateEditor,
  { at = [] }: { at?: Location } = {}
) => {
  editor.tf.unsetNodes('ai', {
    at,
    match: (n) => (n as any).ai,
  });
};
