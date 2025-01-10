import type { DOMPoint } from 'slate-dom';

import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const toSlatePoint = (
  editor: Editor,
  domPoint: DOMPoint,
  options: Omit<Parameters<typeof DOMEditor.toSlatePoint>[2], 'suppressThrow'>
) => {
  try {
    return DOMEditor.toSlatePoint(editor as any, domPoint, options as any);
  } catch {}
};
