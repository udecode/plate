import type { EditorPointRefOptions } from 'slate/dist/interfaces/editor';

import { type Point, pointRef } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const createPointRef = (
  editor: Editor,
  point: Point,
  options?: EditorPointRefOptions
) => pointRef(editor as any, point, options as any);
