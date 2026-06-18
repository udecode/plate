import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const toSlateRange = (
  editor: Editor,
  domRange: Parameters<typeof DOMEditor.toSlateRange>[1],
  options: Omit<Parameters<typeof DOMEditor.toSlateRange>[2], 'supressThrow'>
) => {
  try {
    return DOMEditor.toSlateRange(editor as any, domRange, options);
  } catch {}
};
