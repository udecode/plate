import type { SlateEditor, TLocation } from 'platejs';

export const removeAIMarks = (
  editor: SlateEditor,
  { at = [] }: { at?: TLocation } = {}
) => {
  editor.tf.unsetNodes('ai', {
    at,
    match: (n) => (n as any).ai,
  });
};
