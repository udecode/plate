import type { EditorPointRefOptions } from 'slate/dist/interfaces/editor';

import { pointRef } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';
import type { Point } from '../../interfaces/point';

export const createPointRef = (
  editor: Editor,
  point: Point,
  options?: EditorPointRefOptions
) => pointRef(editor as any, point, options as any);
