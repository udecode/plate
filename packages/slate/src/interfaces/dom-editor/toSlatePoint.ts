import type { DOMPoint } from 'slate-dom';

import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const toSlatePoint = (
  editor: TEditor,
  domPoint: DOMPoint,
  options: Omit<Parameters<typeof DOMEditor.toSlatePoint>[2], 'suppressThrow'>
) => {
  try {
    return DOMEditor.toSlatePoint(editor as any, domPoint, options as any);
  } catch (error) {}
};