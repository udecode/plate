import type { Point } from 'slate';

import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';

export const toDOMPoint = (editor: TEditor, point: Point) => {
  try {
    return DOMEditor.toDOMPoint(editor as any, point);
  } catch (error) {}
};
