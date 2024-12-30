import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const isTargetInsideNonReadonlyVoid = (
  editor: TEditor,
  target: EventTarget | null
) => {
  try {
    return DOMEditor.isTargetInsideNonReadonlyVoid(editor as any, target);
  } catch (error) {}

  return false;
};
