import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';
import type { Point } from '../../interfaces/point';

export const toDOMPoint = (editor: Editor, point: Point) => {
  try {
    return DOMEditor.toDOMPoint(editor as any, point);
  } catch {}
};
