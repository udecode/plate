import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const isTargetInsideNonReadonlyVoid = (
  editor: Editor,
  target: EventTarget | null
) => {
  try {
    return DOMEditor.isTargetInsideNonReadonlyVoid(editor as any, target);
  } catch {}

  return false;
};
