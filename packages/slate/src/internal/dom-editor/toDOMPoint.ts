import type { Point } from 'slate';

import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const toDOMPoint = (editor: Editor, point: Point) => {
  try {
    return DOMEditor.toDOMPoint(editor as any, point);
  } catch (error) {}
};
